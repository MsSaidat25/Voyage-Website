const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Serve static site files
app.use(express.static(path.join(__dirname, 'voyagevista')));

// ── POST /api/chat — AI chatbot ───────────────────────
app.post('/api/chat', async (req, res) => {
  const { model, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'Invalid request' } });
  }

  const apiKey = process.env.OPENROUTER_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'API key not configured' } });
  }

  try {
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
  } catch {
    res.status(500).json({ error: { message: 'Service unavailable' } });
  }
});

// ── POST /api/contact — contact form email ────────────
app.post('/api/contact', async (req, res) => {
  const {
    'first-name': firstName,
    'last-name': lastName,
    email,
    phone,
    'contact-preference': preference,
    message,
    newsletter
  } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const contactTo = process.env.CONTACT_TO || 'hello@voyagevista.ca';

  // If SMTP is not configured, log and succeed silently (useful during development)
  if (!smtpUser || !smtpPass) {
    console.log('Contact form submission received (SMTP not configured):', {
      name: `${firstName} ${lastName || ''}`.trim(),
      email,
      phone,
      preference,
      newsletter,
      message
    });
    return res.json({ ok: true });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: smtpUser, pass: smtpPass }
  });

  const fullName = `${firstName} ${lastName || ''}`.trim();
  const subject = `New Enquiry from ${fullName}`;
  const text = [
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Contact preference: ${preference || 'Email'}`,
    `Newsletter opt-in: ${newsletter ? 'Yes' : 'No'}`,
    '',
    'Message:',
    message
  ].join('\n');

  try {
    await transporter.sendMail({
      from: `"Voyage Vista Website" <${smtpUser}>`,
      to: contactTo,
      replyTo: email,
      subject,
      text
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'voyagevista', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Voyage Vista server running on port ${PORT}`));
