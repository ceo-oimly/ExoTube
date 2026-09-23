import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateVideoPack } from './app/api/generate/route.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Direct Next.js App Router route compatibility on Express
  app.post('/api/generate', async (req, res) => {
    try {
      const { topic, niche, duration, targetWordCount } = req.body || {};
      if (!topic || !String(topic).trim()) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const parsedWordCount = targetWordCount ? Number(targetWordCount) : undefined;

      const result = await generateVideoPack({
        topic: String(topic),
        niche: String(niche || 'Tech'),
        duration: String(duration || '5min'),
        targetWordCount: !isNaN(parsedWordCount as number) && (parsedWordCount as number) > 0 ? (parsedWordCount as number) : undefined,
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Server /api/generate error:', err);
      return res.status(500).json({
        error: err.message || 'Generation failed',
        warning: 'Add valid OpenAI key in .env.local',
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExoTube server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
