import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cloudflare R2 Client (S3 Compatible)
  const getR2Client = () => {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return null;
    }

    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  };

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;

  // API Routes
  app.get('/api/movies', async (req, res) => {
    const s3 = getR2Client();
    if (!s3 || !bucketName) {
      return res.status(500).json({ error: 'R2 Configuration missing. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in secrets.' });
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'movies/',
      });

      const response = await s3.send(command);
      const movies = (response.Contents || []).map(obj => ({
        name: obj.Key?.split('/').pop() || '',
        path: obj.Key || '',
        size: obj.Size,
        uploaded: obj.LastModified?.toISOString(),
        url: `${publicDomain}/${obj.Key}`
      }));

      res.json({ movies });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/upload', (req, res) => {
    const s3 = getR2Client();
    if (!s3 || !bucketName) {
      return res.status(500).json({ error: 'R2 Configuration missing' });
    }

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: 'Form parse error' });

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const movieName = Array.isArray(fields.movieName) ? fields.movieName[0] : fields.movieName;
      const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder;

      if (!file || !movieName || !folder) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const extension = file.originalFilename?.split('.').pop();
      const finalName = movieName.endsWith(`.${extension}`) ? movieName : `${movieName}.${extension}`;
      const storagePath = `movies/${folder.toLowerCase()}/${finalName}`;

      try {
        const fileBuffer = fs.readFileSync(file.filepath);
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: storagePath,
          Body: fileBuffer,
          ContentType: file.mimetype || 'video/mp4',
        });

        await s3.send(command);
        res.json({ 
          success: true, 
          url: `${publicDomain}/${storagePath}`,
          path: storagePath 
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });

  app.delete('/api/movie', express.json(), async (req, res) => {
    const s3 = getR2Client();
    const { path: storagePath } = req.body;

    if (!s3 || !bucketName || !storagePath) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: storagePath,
      });

      await s3.send(command);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
