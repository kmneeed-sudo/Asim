import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = Number(process.env.PORT || 3000);

  // Gemini AI Assistant endpoint
  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const apiKey = process.env.GEMINI_AI_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are an expert Hardware Shop Business Consultant and Inventory Assistant (دکان کا مشیر). 
You help hardware store owners optimize their stock, analyze sales trends, manage customer credit (udhaar khata), suggest pricing strategies, and resolve business issues in Urdu and English.
Context provided: ${JSON.stringify(context || {})}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || 'معذرت، کوئی جواب موصول نہیں ہوا۔' });
    } catch (error: any) {
      console.error('AI Assistant Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate AI response' });
    }
  });

  if (process.env.NODE_ENV !== 'production' || process.env.VITE_DEV_SERVER === 'true') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
