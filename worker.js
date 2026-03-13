/**
 * MovieMax Cloudflare Worker API
 * 
 * This worker handles:
 * - POST /upload: Streaming upload to R2
 * - GET /movies: Listing objects in R2
 * - DELETE /movie: Deleting objects from R2
 * - CORS: Handling cross-origin requests from the dashboard
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    try {
      // 2. Route: GET /movies
      if (request.method === "GET" && path === "/movies") {
        const objects = await env.MOVIES_BUCKET.list({ prefix: "movies/" });
        
        const movies = objects.objects.map(obj => ({
          name: obj.key.split('/').pop(),
          path: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          // Generate public URL using the R2_PUBLIC_DOMAIN environment variable
          url: `${env.R2_PUBLIC_DOMAIN}/${obj.key}`
        }));

        return new Response(JSON.stringify({ movies }), { headers: corsHeaders });
      }

      // 3. Route: POST /upload
      if (request.method === "POST" && path === "/upload") {
        const formData = await request.formData();
        const file = formData.get("file");
        const movieName = formData.get("movieName");
        const folder = formData.get("folder");
        const category = formData.get("category");

        if (!file || !movieName || !folder) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }

        // Validate file type
        const allowedTypes = ["video/mp4", "video/x-matroska", "video/webm"];
        if (!allowedTypes.includes(file.type)) {
          return new Response(JSON.stringify({ error: "Invalid file type. Only mp4, mkv, and webm are allowed." }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }

        // Construct storage path: movies/<folder>/<movieName>
        // Ensure the filename has the correct extension if not provided
        const extension = file.name.split('.').pop();
        const finalName = movieName.endsWith(`.${extension}`) ? movieName : `${movieName}.${extension}`;
        const storagePath = `movies/${folder.toLowerCase()}/${finalName}`;

        // Stream upload to R2
        await env.MOVIES_BUCKET.put(storagePath, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        const publicURL = `${env.R2_PUBLIC_DOMAIN}/${storagePath}`;

        return new Response(JSON.stringify({ 
          success: true, 
          url: publicURL,
          path: storagePath 
        }), { headers: corsHeaders });
      }

      // 4. Route: DELETE /movie
      if (request.method === "DELETE" && path === "/movie") {
        const { path: storagePath } = await request.json();

        if (!storagePath) {
          return new Response(JSON.stringify({ error: "Missing path" }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }

        await env.MOVIES_BUCKET.delete(storagePath);

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // 404 for other routes
      return new Response(JSON.stringify({ error: "Not Found" }), { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  },
};
