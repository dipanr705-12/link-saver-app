import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize local database file
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], links: [] }, null, 2));
}

function readData() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [], links: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// In-memory sessions token map: token -> user
const activeSessions = new Map();

app.use(cors());
app.use(express.json());

// Serve static built frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware to authenticate user token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = activeSessions.get(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in.' });
  }
  req.user = user;
  next();
}

// Auth: Sign Up
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and password (min 6 chars) required' });
  }

  const data = readData();
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = data.users.find(u => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    created_at: new Date().toISOString()
  };

  data.users.push(newUser);
  writeData(data);

  const token = crypto.randomBytes(32).toString('hex');
  const sessionUser = { id: newUser.id, email: newUser.email };
  activeSessions.set(token, sessionUser);

  res.json({ token, user: sessionUser });
});

// Auth: Sign In
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const data = readData();
  const normalizedEmail = email.toLowerCase().trim();
  const user = data.users.find(u => u.email === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const sessionUser = { id: user.id, email: user.email };
  activeSessions.set(token, sessionUser);

  res.json({ token, user: sessionUser });
});

// Auth: Get current session user
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ user: null });
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = activeSessions.get(token) || null;
  res.json({ user });
});

// Auth: Sign Out
app.post('/api/auth/signout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// Links: Get links owned by authenticated user ONLY
app.get('/api/links', authenticate, (req, res) => {
  const data = readData();
  const userLinks = data.links.filter(l => l.user_id === req.user.id);
  userLinks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(userLinks);
});

// Links: Create a link for authenticated user
app.post('/api/links', authenticate, (req, res) => {
  const { title, url, category, description } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const newLink = {
    id: crypto.randomUUID(),
    user_id: req.user.id,
    title: title || url,
    url,
    category: category || 'General',
    description: description || '',
    created_at: new Date().toISOString()
  };

  const data = readData();
  data.links.push(newLink);
  writeData(data);

  res.json(newLink);
});

// Links: Delete link (Strict check: only the creator can delete!)
app.delete('/api/links/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const data = readData();

  const link = data.links.find(l => l.id === id);
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  // Security check: prevents anyone else from deleting
  if (link.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized! You can only delete your own links.' });
  }

  data.links = data.links.filter(l => l.id !== id);
  writeData(data);

  res.json({ success: true });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LinkVault server listening on port ${PORT}`);
});
