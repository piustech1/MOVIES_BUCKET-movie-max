/**
 * CLOUDFLARE WORKER FOR MOVIEMAX R2 SERVER
 *
 * This is a highly robust, zero-dependency Cloudflare Worker script.
 * It connects to your R2 bucket (MOVIES_BUCKET: moviemaxug) and handles:
 *  1. Admin header validation (X-Auth-Key: greatdev).
 *  2. Full cursor-based pagination for GET /movies (returns ALL objects under movies/ with URLs properly encoded).
 *  3. Presigned PUT URL generation for direct client uploads with path consistency (movies/{folder}/{movieName}).
 *  4. Upload verification (GET /verify-upload) checking existence before client-side finalization.
 *  5. Verified deletes (DELETE /movie) asserting object existence before and after deletion with safety checkpoints.
 *  6. CORS handling for all web clients.
 *
 * DEPLOYMENT INSTRUCTIONS:
 *  1. Copy this entire script.
 *  2. Paste it directly into your Cloudflare Worker Dashboard (or put it in index.js for Wrangler).
 *  3. In your Worker settings under "Variables", add the following environment secrets:
 *     - R2_ACCOUNT_ID = <your_cloudflare_account_id>
 *     - R2_ACCESS_KEY_ID = <your_r2_token_access_key_id>
 *     - R2_SECRET_ACCESS_KEY = <your_r2_token_secret_access_key>
 *     - R2_PUBLIC_DOMAIN = https://pub-b99e0d2a3d4b4b618ce04a685e0b44ff.r2.dev (or your custom domain)
 *  4. In your Worker settings under "R2 Bucket Bindings", bind:
 *     - Bucket name: moviemaxug
 *     - Variable name: MOVIES_BUCKET
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Auth-Key"
};

// HMAC-SHA256 Helper for AWS V4 signature
async function hmac(key, data) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    typeof data === "string" ? encoder.encode(data) : data
  );
  return new Uint8Array(signature);
}

// Convert buffer to hex string
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// SHA-256 Hex Digest Helper
async function sha256hex(str) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return bufferToHex(buffer);
}

// Encode path parts individually while keeping slashes intact to avoid broken URLs with spaces
function encodePath(path) {
  return path.split("/").map(part => encodeURIComponent(part)).join("/");
}

// Generates AWS Single-Use Presigned PUT URL for Cloudflare R2 compatibility API
async function getPresignedUrl(env, key, contentType, expiresIn = 3600) {
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const accountId = env.R2_ACCOUNT_ID;
  const bucketName = "moviemaxug"; // Bucket name for S3 compatible URL signature
  
  if (!accessKeyId || !secretAccessKey || !accountId) {
    throw new Error("Missing R2 administrative credentials in env bindings (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID)");
  }
  
  const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const date = datetime.substring(0, 8);
  
  const method = "PUT";
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const path = `/${bucketName}/${encodePath(key)}`;
  
  const queryParams = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${date}/auto/s3/aws4_request`,
    "X-Amz-Date": datetime,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host"
  };
  
  // Sort query parameters alphabetically to build deterministic Canonical Query String
  const sortedQuery = Object.keys(queryParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join("&");
    
  const canonicalRequest = [
    method,
    path,
    sortedQuery,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD" // Bypasses body hashing during pre-signature phase (crucial for direct stream PUTs)
  ].join("\n");
  
  const hashedCanonicalRequest = await sha256hex(canonicalRequest);
  
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    datetime,
    `${date}/auto/s3/aws4_request`,
    hashedCanonicalRequest
  ].join("\n");
  
  // Deriving the AWS signing key
  const kDate = await hmac(`AWS4${secretAccessKey}`, date);
  const kRegion = await hmac(kDate, "auto");
  const kService = await hmac(kRegion, "s3");
  const kSigning = await hmac(kService, "aws4_request");
  
  const signature = bufferToHex(await hmac(kSigning, stringToSign));
  
  const uploadUrl = `https://${host}${path}?${sortedQuery}&X-Amz-Signature=${signature}`;
  return uploadUrl;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. CORS Preflight Handler
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Security Check (Admin authorization required)
    const authKey = request.headers.get("X-Auth-Key");
    const MASTER_KEY = "greatdev";

    if (authKey !== MASTER_KEY) {
      console.warn(`[Security Alert] Denied access from: ${request.headers.get("cf-connecting-ip")}`);
      return new Response(JSON.stringify({ error: "Unauthorized access: Access-key token missing or rejected." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Main Routing Protocol
    try {
      
      /**
       * GET /movies
       * Lists all movies under prefix "movies/" using robust cursor-based pagination
       * to retrieve ALL files in the R2 bucket.
       */
      if (url.pathname === "/movies" && request.method === "GET") {
        console.log("[List Protocol] Fetching paginated index...");
        
        let allObjects = [];
        let cursor = undefined;
        let truncated = true;
        let pageCount = 0;
        
        while (truncated) {
          pageCount++;
          const listOptions = {
            prefix: "movies/"
          };
          if (cursor) listOptions.cursor = cursor;
          
          console.log(`[List Protocol] Iterating page ${pageCount} (Cursor: ${cursor || "None"})`);
          const objects = await env.MOVIES_BUCKET.list(listOptions);
          
          allObjects = allObjects.concat(objects.objects);
          truncated = objects.truncated;
          cursor = objects.cursor;
        }
        
        console.log(`[List Protocol] Completed query. Total retrieved: ${allObjects.length} objects over ${pageCount} cursor pages.`);

        const PUBLIC_DOMAIN = env.R2_PUBLIC_DOMAIN || "https://pub-b99e0d2a3d4b4b618ce04a685e0b44ff.r2.dev";
        
        const movies = allObjects.map(obj => {
          const parts = obj.key.split("/");
          // Schema matches path structural formula movies/{folder}/{movieName}
          const folderSegment = parts[1] || "General";
          const fileName = parts.slice(2).join("/") || parts[1] || obj.key;
          
          // Fix URL-encoding to preserve folder structure and handle space characters seamlessly
          const urlEncodedKey = encodePath(obj.key);
          const downloadUrl = `${PUBLIC_DOMAIN}/${urlEncodedKey}`;

          return {
            name: fileName,
            path: obj.key,
            size: obj.size,
            uploadedAt: obj.uploaded ? obj.uploaded.toISOString() : new Date().toISOString(),
            url: downloadUrl,
            folder: folderSegment,
            category: folderSegment
          };
        });

        return new Response(JSON.stringify({ success: true, movies }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      /**
       * GET /presign
       * Generates a secure, expiring presigned URL for direct PUT transfers
       */
      if (url.pathname === "/presign" && request.method === "GET") {
        const movieName = url.searchParams.get("movieName");
        const folder = url.searchParams.get("folder") || "General";
        const contentType = url.searchParams.get("contentType") || "video/mp4";
        
        if (!movieName) {
          return new Response(JSON.stringify({ error: "Required parameter 'movieName' is missing" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        // Fix path consistency: always resolve to movies/{folder}/{movieName}
        const cleanFolder = folder.trim().replace(/\/$/, ""); 
        const cleanMovieName = movieName.trim();
        const key = `movies/${cleanFolder}/${cleanMovieName}`;
        
        console.log(`[Presign Protocol] Generating upload key: ${key}`);
        
        const uploadUrl = await getPresignedUrl(env, key, contentType);
        console.log(`[Presign Protocol] URL Created for key: ${key}`);
        
        return new Response(JSON.stringify({ success: true, uploadUrl, key }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      /**
       * GET /verify-upload
       * Performs a high-efficiency HEAD lookup on R2 with multiple intelligent encoding fallbacks
       * and directory-listing matching to verify object existence securely.
       */
      if (url.pathname === "/verify-upload" && request.method === "GET") {
        const key = url.searchParams.get("key");
        if (!key) {
          return new Response(JSON.stringify({ error: "Required parameter 'key' is missing" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        console.log(`[Verify Protocol] Initiating checks for key: ${key}`);
        let objMeta = null;
        let resolvedKey = key;

        // Strategy 1: Direct Head Lookup with exact key
        try {
          objMeta = await env.MOVIES_BUCKET.head(key);
          if (objMeta) {
            console.log(`[Verify Protocol] Exact key check details found: ${key}`);
          }
        } catch (e) {
          console.warn(`[Verify Protocol] Error checking exact key '${key}':`, e.message);
        }

        // Strategy 2: Check URL-encoded and URL-decoded key variations
        if (!objMeta) {
          const variations = [
            decodeURIComponent(key),
            key.replace(/ /g, "%20"),
            key.replace(/%20/g, " "),
            key.replace(/\+/g, " "),
            key.replace(/ /g, "+")
          ];

          for (const variant of variations) {
            if (variant !== key) {
              try {
                const variantMeta = await env.MOVIES_BUCKET.head(variant);
                if (variantMeta) {
                  console.log(`[Verify Protocol] Match discovered on variation path: '${variant}'`);
                  objMeta = variantMeta;
                  resolvedKey = variant;
                  break;
                }
              } catch (_) {}
            }
          }
        }

        // Strategy 3: List-prefix scan matching to auto-resolve keys
        if (!objMeta) {
          const parts = key.split("/");
          if (parts.length >= 2) {
            const folderPrefix = parts.slice(0, 2).join("/") + "/"; // e.g., 'movies/vj-junior/'
            const targetFileName = parts.slice(2).join("/"); // e.g., 'movie.mp4'
            console.log(`[Verify Protocol] Exact matches not found. Listing prefix: '${folderPrefix}' targeting name: '${targetFileName}'`);
            
            try {
              const listResult = await env.MOVIES_BUCKET.list({ prefix: folderPrefix });
              const matchedObj = listResult.objects.find(obj => {
                const cleanObjName = decodeURIComponent(obj.key).toLowerCase();
                const cleanTargetName = decodeURIComponent(targetFileName).toLowerCase();
                const exactRawTarget = targetFileName.toLowerCase();
                return cleanObjName.endsWith(cleanTargetName) || 
                       cleanObjName.endsWith(exactRawTarget) ||
                       cleanObjName === decodeURIComponent(key).toLowerCase();
              });

              if (matchedObj) {
                console.log(`[Verify Protocol] Directory scanning matched object: '${matchedObj.key}'`);
                objMeta = matchedObj;
                resolvedKey = matchedObj.key;
              }
            } catch (listErr) {
              console.warn('[Verify Protocol] List prefix scan encountered error:', listErr.message);
            }
          }
        }

        if (objMeta) {
          console.log(`[Verify Protocol] SUCCESS: Key finalized as '${resolvedKey}' (${objMeta.size} bytes)`);
          return new Response(JSON.stringify({ 
            success: true, 
            exists: true, 
            size: objMeta.size,
            key: resolvedKey
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          console.warn(`[Verify Protocol] FAILURE: No matching keys found for: ${key}`);
          return new Response(JSON.stringify({ 
            success: false, 
            exists: false, 
            error: "Storage target verification returned negative trace after all fallbacks." 
          }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      /**
       * DELETE /movie
       * Verifies the file actually exists before deletion, issues deletion, and checks status afterward
       */
      if (request.method === "DELETE") {
        let path = "";
        
        // Attempt JSON parsing from request body
        try {
          const body = await request.json();
          path = body.path;
        } catch (_) {
          // Fallback to query param
          path = url.searchParams.get("path") || "";
        }

        // Fallback to pathname wildcard parsing (e.g., /movies/:path or /movie/:path)
        if (!path) {
          const pathParamMatch = url.pathname.match(/^\/(?:movies|movie)\/(.+)$/);
          if (pathParamMatch) {
            path = decodeURIComponent(pathParamMatch[1]);
          }
        }

        if (!path) {
          return new Response(JSON.stringify({ error: "Delete parameter 'path' is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        console.log(`[Delete Protocol] Phase 1 - Confirming existence before deletion for: ${path}`);
        const exists = await env.MOVIES_BUCKET.head(path);
        
        if (!exists) {
          console.warn(`[Delete Protocol] ABORTED: Object does not exist: ${path}`);
          return new Response(JSON.stringify({ error: `Object not found: '${path}' or has already been deleted.` }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        console.log(`[Delete Protocol] Phase 2 - Issuing delete command on R2...`);
        await env.MOVIES_BUCKET.delete(path);
        
        console.log(`[Delete Protocol] Phase 3 - Verifying deletion confirmed...`);
        const confirmExists = await env.MOVIES_BUCKET.head(path);
        
        if (confirmExists) {
          console.error(`[Delete Protocol] FAILURE: Object still presents in R2: ${path}`);
          return new Response(JSON.stringify({ error: "Deletion checkpoint failed: Storage node reports object still presence." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        console.log(`[Delete Protocol] SUCCESS: Completely wiped: ${path}`);
        return new Response(JSON.stringify({ success: true, message: "Object successfully deleted and verified." }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 4. Endpoint Not Found
      return new Response(JSON.stringify({ error: "Endpoint not found on MovieMax Worker" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error("[Fatal Error Log]", err);
      return new Response(JSON.stringify({ error: "Fatal Internal Worker Error", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
