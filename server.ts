import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateVideoPack } from './app/api/generate/route.ts';

// Load .env and .env.local
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

// Support import.meta.env in Node/Express runtime
if (typeof (import.meta as any).env === 'undefined') {
  (import.meta as any).env = {
    ...process.env,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
  };
} else if (!(import.meta as any).env.VITE_GEMINI_API_KEY) {
  (import.meta as any).env.VITE_GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
}

// API Key check using import.meta.env.VITE_GEMINI_API_KEY
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isGeminiKeyValid = Boolean(
  geminiApiKey &&
  geminiApiKey.trim().length > 10 &&
  !geminiApiKey.includes('MY_GEMINI_API_KEY')
);

if (isGeminiKeyValid) {
  console.log(`[ExoTube] Valid VITE_GEMINI_API_KEY detected via import.meta.env (${geminiApiKey.slice(0, 6)}...)`);
} else {
  console.warn('[ExoTube] Warning: VITE_GEMINI_API_KEY not found in .env');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Status & Key Check Endpoint
  app.get('/api/status', (_req, res) => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    const isValid = Boolean(
      key &&
      key.trim().length > 10 &&
      !key.includes('MY_GEMINI_API_KEY')
    );
    return res.json({
      status: 'ok',
      hasKey: isValid,
      provider: isValid ? 'gemini' : 'demo',
    });
  });

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
