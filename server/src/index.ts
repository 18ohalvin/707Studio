import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { testDbConnection } from './db.js';
import { brandsRouter } from './routes/brands.js';
import { pagesRouter } from './routes/pages.js';
import { templatesRouter } from './routes/templates.js';
import { submissionsRouter } from './routes/submissions.js';
import { mediaRouter } from './routes/media.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads folder exists in root public/uploads or server/public/uploads
const rootUploadDir = fs.existsSync(path.resolve(process.cwd(), 'public'))
  ? path.resolve(process.cwd(), 'public/uploads')
  : path.resolve(process.cwd(), '../public/uploads');

if (!fs.existsSync(rootUploadDir)) {
  fs.mkdirSync(rootUploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(rootUploadDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: '707 Activation Builder API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/brands', brandsRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/media', mediaRouter);

// Start Server
async function startServer() {
  await testDbConnection();
  app.listen(PORT, () => {
    console.log(`[707 Activation Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
