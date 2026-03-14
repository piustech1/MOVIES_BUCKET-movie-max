import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const db = new Database('moviemax.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS vjs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Authentication Middleware
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authKey = req.headers['x-auth-key'];
    if (authKey === 'greatdev') {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized access. Please login.' });
    }
  };

  // VJ Management API (Protected)
  app.get('/api/vjs', authMiddleware, (req, res) => {
    const vjs = db.prepare('SELECT * FROM vjs ORDER BY name ASC').all();
    res.json(vjs);
  });

  app.post('/api/vjs', authMiddleware, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
      const info = db.prepare('INSERT INTO vjs (name) VALUES (?)').run(name);
      res.json({ id: info.lastInsertRowid, name });
    } catch (err: any) {
      res.status(400).json({ error: 'VJ already exists' });
    }
  });

  app.delete('/api/vjs/:id', authMiddleware, (req, res) => {
    db.prepare('DELETE FROM vjs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
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
