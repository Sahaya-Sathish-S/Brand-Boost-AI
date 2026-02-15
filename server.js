const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
const db = new sqlite3.Database(path.join(__dirname, 'data', 'brandboost.db'));

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    name TEXT,
    business TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES chats(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS generated_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    theme TEXT,
    content TEXT,
    media_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`INSERT OR IGNORE INTO profile (id, name, business) VALUES (1, '', '')`);
}

function businessAssistantResponse(text) {
  const intro = `Great question. Here is a clear business-focused action plan for: "${text}"`;
  const steps = [
    'Define your exact goal, target customer, and success metric.',
    'Create a 7-day content + promotion strategy (post, reel, offer, CTA).',
    'Use one strong offer and one trust builder (review/testimonial/case).',
    'Track spend, leads, and conversion; optimize weak steps daily.',
    'Scale only after positive ROI for 2 consecutive weeks.'
  ];
  const flow = 'Flowchart: Goal -> Audience -> Offer -> Content -> Traffic -> Leads -> Sales -> Analytics -> Improve';
  return `${intro}\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${flow}`;
}

app.get('/api/profile', async (req, res) => {
  const profile = await get('SELECT name, business FROM profile WHERE id = 1');
  res.json(profile || { name: '', business: '' });
});

app.post('/api/profile', async (req, res) => {
  const { name = '', business = '' } = req.body;
  await run('UPDATE profile SET name = ?, business = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [name, business]);
  res.json({ ok: true });
});

app.get('/api/chats', async (req, res) => {
  const chats = await all('SELECT id, title, created_at FROM chats ORDER BY id DESC');
  res.json(chats);
});

app.post('/api/chats', async (req, res) => {
  const countRow = await get('SELECT COUNT(*) as count FROM chats');
  const n = (countRow?.count || 0) + 1;
  const result = await run('INSERT INTO chats(title) VALUES(?)', [`Chat ${n}`]);
  res.json({ id: result.lastID, title: `Chat ${n}` });
});

app.get('/api/chats/:id/messages', async (req, res) => {
  const rows = await all('SELECT id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY id', [req.params.id]);
  res.json(rows);
});

app.delete('/api/chats/:id/messages', async (req, res) => {
  await run('DELETE FROM messages WHERE chat_id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/chats/:id/messages', async (req, res) => {
  const { content = '' } = req.body;
  if (!content.trim()) return res.status(400).json({ error: 'Message required' });

  await run('INSERT INTO messages(chat_id, role, content) VALUES(?, ?, ?)', [req.params.id, 'user', content.trim()]);

  const profile = await get('SELECT name, business FROM profile WHERE id = 1');
  const personalizedPrefix = profile?.name && profile?.business
    ? `What about your business, ${profile.name}? Since you run ${profile.business}, `
    : '';

  const reply = `${personalizedPrefix}${businessAssistantResponse(content.trim())}`;
  await run('INSERT INTO messages(chat_id, role, content) VALUES(?, ?, ?)', [req.params.id, 'assistant', reply]);

  res.json({ ok: true, assistant: reply });
});

app.post('/api/generate', async (req, res) => {
  const { type = 'photo', theme = 'Modern Glow', details = {} } = req.body;
  const outputMap = {
    photo: {
      title: 'Social Poster Output',
      text: `Poster concept for ${details.companyName || 'your brand'} using ${theme}. Source: ${details.sourceTool || 'AI stock sources'} and style ${details.aiStyle || 'Modern Premium'}. Focus: ${details.offer || 'high-conversion offer'} with clear CTA for social engagement.`
    },
    video: {
      title: 'Reel / Shorts Video Concept',
      text: `Video storyboard with ${details.animationType || 'Slide Animation'} and ${details.videoTone || 'Professional'} tone. Opening hook, value points, and CTA are optimized for social reach.`
    },
    ad: {
      title: 'Ad Idea + Script Hook',
      text: `Platform: ${details.platform || 'Instagram'}. Audience: ${details.audience || 'target customers'}. Ad hook + script angle prepared with CTA: ${details.cta || 'DM now'}.`
    },
    caption: {
      title: 'Description + Title Set',
      text: `SEO-friendly title and caption pack for ${details.postType || 'social post'} around keyword "${details.keyword || 'brand growth'}" with engagement hashtags.`
    }
  };

  const selected = outputMap[type] || outputMap.photo;
  const mediaUrl = type === 'video'
    ? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    : `https://picsum.photos/seed/${Date.now()}/960/540`;

  const result = await run(
    'INSERT INTO generated_items(type, title, theme, content, media_url) VALUES (?, ?, ?, ?, ?)',
    [type, selected.title, theme, selected.text, mediaUrl]
  );

  res.json({
    id: result.lastID,
    title: selected.title,
    text: selected.text,
    mediaUrl,
    footer: 'By Brand Boost AI'
  });
});

app.get('/api/gallery', async (req, res) => {
  const rows = await all('SELECT id, type, title, theme, content, media_url, created_at FROM generated_items ORDER BY id DESC');
  res.json(rows);
});

app.get('/api/analytics', (req, res) => {
  res.json({
    investment: 125000,
    revenue: 198000,
    profit: 73000,
    lossRisk: 11,
    pie: [
      { label: 'Ads', value: 35 },
      { label: 'Operations', value: 25 },
      { label: 'Product', value: 20 },
      { label: 'Savings', value: 20 }
    ]
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`BrandBoost AI running on http://localhost:${PORT}`);
  });
});
