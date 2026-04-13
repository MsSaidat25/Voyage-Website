const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Secure API proxy — key lives in Render environment variables
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages' });
    }

    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.voyagevista.ca',
        'X-Title': 'Voyage Vista Concierge'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3.5-haiku',
        max_tokens: 400,
        messages
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Voyage Vista running on port ${PORT}`));
