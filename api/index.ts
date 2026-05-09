import { Hono } from 'hono';
import { cors } from 'hono/cors';

export const app = new Hono();

app.use('*', cors());

app.get('/', (c) => {
  return c.text('Mathflix New API Running!');
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
