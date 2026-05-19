import { Hono } from 'hono';
import { cors } from 'hono/cors';
import crypto from 'node:crypto';

export const app = new Hono();

app.use('*', cors());

type DiscussionComment = {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: string;
  created_at: string;
};

type DiscussionPost = {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: string;
  category: string;
  tags: string[];
  created_at: string;
  likes_count: number;
  liked_by: string[];
  read_by: string[];
  solved_comment_id: string | null;
  is_locked: boolean;
  comments: DiscussionComment[];
};

const discussions: DiscussionPost[] = [];

const asTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 8);
};

const serializeDiscussion = (post: DiscussionPost, userId?: string | null) => ({
  ...post,
  liked_by_me: !!userId && post.liked_by.includes(userId),
  has_unread: !!userId && post.author_id !== userId && !post.read_by.includes(userId),
});

app.get('/', (c) => {
  return c.text('Mathflix New API Running!');
});

app.get('/discussions', (c) => {
  const userId = c.req.query('user_id');
  const payload = discussions.map((post) => serializeDiscussion(post, userId));
  return c.json(payload);
});

app.post('/discussions', async (c) => {
  const body = await c.req.json();
  const content = String(body?.content || '').trim();
  if (!content) {
    return c.json({ error: 'content required' }, 400);
  }

  const post: DiscussionPost = {
    id: crypto.randomUUID(),
    content,
    author_id: String(body?.author_id || 'unknown'),
    author_name: String(body?.author_name || 'Anonymous'),
    author_role: String(body?.author_role || 'student'),
    category: String(body?.category || 'Umum'),
    tags: asTags(body?.tags),
    created_at: new Date().toISOString(),
    likes_count: 0,
    liked_by: [],
    read_by: [],
    solved_comment_id: null,
    is_locked: false,
    comments: [],
  };
  discussions.unshift(post);
  return c.json(post);
});

app.post('/discussions/:id/like', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = String(body?.user_id || '').trim();
  if (!userId) return c.json({ error: 'user_id required' }, 400);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);

  const hasLiked = post.liked_by.includes(userId);
  if (hasLiked) {
    post.liked_by = post.liked_by.filter((id) => id !== userId);
    post.likes_count = Math.max(0, post.likes_count - 1);
  } else {
    post.liked_by.push(userId);
    post.likes_count += 1;
  }

  return c.json({ liked: !hasLiked, likes_count: post.likes_count });
});

app.post('/discussions/:id/read', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = String(body?.user_id || '').trim();
  if (!userId) return c.json({ error: 'user_id required' }, 400);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  if (!post.read_by.includes(userId)) {
    post.read_by.push(userId);
  }
  return c.json({ status: 'ok' });
});

app.post('/discussions/:id/comments', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const content = String(body?.content || '').trim();
  if (!content) return c.json({ error: 'content required' }, 400);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  if (post.is_locked) return c.json({ error: 'discussion is locked' }, 400);

  const comment: DiscussionComment = {
    id: crypto.randomUUID(),
    content,
    author_id: String(body?.author_id || 'unknown'),
    author_name: String(body?.author_name || 'Anonymous'),
    author_role: String(body?.author_role || 'student'),
    created_at: new Date().toISOString(),
  };

  post.comments.push(comment);
  return c.json(comment);
});

app.patch('/discussions/:id/solved', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const solvedCommentId = body?.solved_comment_id ? String(body.solved_comment_id) : null;

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  if (solvedCommentId && !post.comments.some((comment) => comment.id === solvedCommentId)) {
    return c.json({ error: 'comment not found' }, 404);
  }
  post.solved_comment_id = solvedCommentId;
  return c.json({ status: 'ok', solved_comment_id: solvedCommentId });
});

app.patch('/discussions/:id/lock', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const isLocked = Boolean(body?.is_locked);

  const post = discussions.find((item) => item.id === id);
  if (!post) return c.json({ error: 'discussion not found' }, 404);
  post.is_locked = isLocked;
  return c.json({ status: 'ok', is_locked: isLocked });
});

app.delete('/discussions/:id', (c) => {
  const id = c.req.param('id');
  const index = discussions.findIndex((item) => item.id === id);
  if (index === -1) return c.json({ error: 'discussion not found' }, 404);
  discussions.splice(index, 1);
  return c.json({ status: 'ok' });
});

app.delete('/discussions/comments/:id', (c) => {
  const id = c.req.param('id');
  for (const post of discussions) {
    const commentIndex = post.comments.findIndex((comment) => comment.id === id);
    if (commentIndex !== -1) {
      post.comments.splice(commentIndex, 1);
      if (post.solved_comment_id === id) post.solved_comment_id = null;
      return c.json({ status: 'ok' });
    }
  }
  return c.json({ error: 'comment not found' }, 404);
});

// Google OAuth Auth Routes
app.get('/auth/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!clientId) {
    return c.text('Error: GOOGLE_CLIENT_ID is not configured in environment.', 500);
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
  return c.redirect(url);
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9111';

  if (!code) return c.text('No code provided', 400);

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return c.text('Error from Google: ' + tokenData.error_description, 400);
    }

    // 2. Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const email = userData.email as string;

    // 3. Determine Role based on email
    let role = 'student';
    if (email === 'the.real.ferilee@gmail.com') {
      role = 'admin';
    } else if (
      email.endsWith('@guru.smk.belajar.id') ||
      email.endsWith('@guru.sma.belajar.id') ||
      email.endsWith('@guru.smp.belajar.id') ||
      email.endsWith('@guru.sd.belajar.id')
    ) {
      role = 'guru';
    }

    // 4. Construct payload and send to frontend
    // TODO: Create a real JWT token and save user to database here
    const mathflixToken = "temporary_dummy_token";
    const userDataString = JSON.stringify({
      id: email, // use email as temporary ID
      email: email,
      role: role,
      full_name: userData.name,
      photo_profile: userData.picture
    });

    return c.redirect(`${frontendUrl}/oauth/callback?token=${mathflixToken}&user=${encodeURIComponent(userDataString)}`);
  } catch (error) {
    console.error('OAuth Error:', error);
    return c.text('Internal Server Error during OAuth process', 500);
  }
});

// Mock Routes untuk mengatasi 404 pada Frontend
app.get('/billing/access', (c) => c.json({ access: true, status: 'active' }));
app.get('/materials', (c) => c.json([]));
app.get('/quizzes', (c) => c.json([]));

// Catch-all route untuk menangkap semua GET request lainnya (announcements, discussions, dll)
app.all('*', (c) => {
  return c.json([]);
});

export default {
  port: Number(process.env.PORT || 3000),
  fetch: app.fetch,
};
