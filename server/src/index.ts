import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { testDbConnection, getDbStatus } from './db.js';
import { authRouter, requireAuth } from './auth.js';
import { brandsRouter } from './routes/brands.js';
import { usersRouter } from './routes/users.js';
import { pagesRouter } from './routes/pages.js';
import { templatesRouter } from './routes/templates.js';
import { submissionsRouter } from './routes/submissions.js';
import { mediaRouter } from './routes/media.js';
import { notificationsRouter } from './routes/notifications.js';
import { resolveUploadDir } from './uploads.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const uploadDir = resolveUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
// Images arrive base64-encoded, which is ~33% larger than the file, so 50mb
// rejected any picture over roughly 37 MB outright. Raised so file size is not
// the cap; the practical ceiling is now upload time against the proxy's 60s
// timeout, not an artificial byte limit.
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use('/uploads', express.static(uploadDir));

// API Health Check — reports the database too. The pool falls back to
// in-memory storage when Postgres is unreachable, which looks healthy from the
// outside while silently dropping every write on restart, so surface it here.
app.get('/api/health', (req, res) => {
  const db = getDbStatus();
  res.json({
    status: db.isConnected ? 'ok' : 'degraded',
    project: '707 Activation Builder API',
    database: db.isConnected ? 'connected' : 'disconnected (in-memory fallback — data will be lost)',
    timestamp: new Date().toISOString()
  });
});

// Superadmin verification endpoint
app.use('/api/auth', authRouter);

// Studio & Brand Activation Endpoints
// Protected routes require authentication inside each router; public endpoints
// like published drop canvas pages (GET /api/pages/:brandSlug/:pageSlug) and
// raffle entries (POST /api/submissions) are open to public mobile visitors.
app.use('/api/brands', brandsRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/templates', requireAuth, templatesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/media', requireAuth, mediaRouter);
app.use('/api/notifications', requireAuth, notificationsRouter);

// Any unmatched /api path must fail as JSON. Letting it fall through to the SPA
// would answer an API call with HTML and turn a plain 404 into a confusing
// client-side parse error.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown API endpoint' });
});

// ----------------------------------------------------
// Serve the built frontend (single container, single domain)
// ----------------------------------------------------
const candidateDirs = [
  path.resolve(process.cwd(), 'public/app'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(process.cwd(), '../public/app')
];
const distDir = candidateDirs.find(d => fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html'))) || candidateDirs[0];

if (fs.existsSync(distDir)) {
  // Hashed asset filenames can be cached hard; index.html is the manifest that
  // points at them and must never be cached, or a browser stays pinned to a
  // previous build after a deploy.
  app.use(
    '/assets',
    express.static(path.join(distDir, 'assets'), {
      setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    })
  );

  app.use('/assets', (_req, res) => {
    res.status(404).json({ error: 'Asset not found (stale client build)' });
  });

  app.use(express.static(distDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      }
    }
  }));

  app.use((_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  console.warn(`[Server] No frontend build at ${distDir} — running API only.`);
}

// Start Server
async function startServer() {
  await testDbConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[707 Activation Server] Running on port ${PORT}`);
    console.log(`[707 Activation Server] Uploads directory: ${uploadDir}`);
  });
}

startServer();
