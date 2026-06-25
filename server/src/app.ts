import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { getPosts, getPostBySlug, createPost, updatePost, deletePost } from './db';

const app = express();

// The admin secret must be provided via env. There is intentionally no default:
// if it is missing, the admin write API is disabled rather than left open.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
if (!ADMIN_TOKEN) {
  console.warn('[WARN] ADMIN_TOKEN is not set — admin login and write operations are disabled.');
}

// In-memory set of issued session tokens. Logging in mints a random,
// opaque session token; the long-lived admin secret is never sent to the client.
// NOTE: on serverless (Vercel) this set lives per-instance, so a minted session
// is only valid on the instance that issued it. Fine for occasional admin use;
// move to a shared store (e.g. Supabase / Redis) if you need durable sessions.
const sessions = new Set<string>();

// Constant-time comparison to avoid leaking the secret via timing.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Allowed CORS origins come from CORS_ORIGIN (comma-separated). Defaults to the
// local Vite dev server. Same-origin requests (frontend + API on one Vercel
// domain) don't need CORS at all. Use '*' explicitly only if you really want it open.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Auth Middleware — validates the bearer token against issued session tokens.
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token || !sessions.has(token)) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired session' });
  }
  next();
};

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await getPosts();
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const newPost = await createPost(req.body);
    res.status(201).json(newPost);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPost = await updatePost(id, req.body);
    res.json(updatedPost);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deletePost(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login — mints a short-lived random session token on success.
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ error: 'Admin login is disabled (ADMIN_TOKEN not configured).' });
  }
  if (typeof password === 'string' && safeEqual(password, ADMIN_TOKEN)) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.add(sessionToken);
    res.json({ token: sessionToken });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Logout — revokes the current session token.
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization!.split(' ')[1];
  sessions.delete(token);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', supabase: !!process.env.SUPABASE_URL });
});

export default app;
