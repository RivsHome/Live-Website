import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config(); // load .env

// ESM‐safe __filename & __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json());

// serve your front-end from rivshome-landing/
app.use(express.static(path.join(__dirname, 'rivshome-landing')));

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const apiRes = await fetch(
      'https://api.mistral.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: "You are RIVS Home's assistant, a professional home improvement company in Connecticut. You only answer based on the company's services and trained information. If asked for a phone number, always respond with (860) 999-6408. Never guess or invent a phone number.",
            },
            { role: 'user', content: req.body.message },
          ],
        }),
      }
    );
    const data = await apiRes.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
