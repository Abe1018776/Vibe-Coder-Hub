# Enabling Google sign-in (one-time, ~5 minutes)

The app's sign-in code is complete. Google sign-in only needs OAuth credentials,
which **you** create in Google Cloud and paste into Supabase. No code changes.

Supabase project: **lqfqkivbxeexmrxuxefi**
Supabase OAuth callback URL (you'll need this below):

```
https://lqfqkivbxeexmrxuxefi.supabase.co/auth/v1/callback
```

## 1. Create Google OAuth credentials
1. Go to https://console.cloud.google.com → create (or pick) a project.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create.
   - App name: `YidVibe`. User support email + developer email: your email.
   - Scopes: the defaults (email, profile, openid) are enough → Save.
   - While testing you can add your own email under **Test users** (or publish the app).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins:** `http://localhost:3000` (add `https://yidvibe.com` later).
   - **Authorized redirect URIs:** `https://lqfqkivbxeexmrxuxefi.supabase.co/auth/v1/callback`
   - Create → copy the **Client ID** and **Client secret**.

## 2. Paste into Supabase
1. Supabase dashboard → **Authentication → Sign In / Providers → Google**.
2. Toggle **Enable**, paste the **Client ID** and **Client secret**, Save.

## 3. Set the redirect URLs in Supabase
**Authentication → URL Configuration:**
- **Site URL:** `http://localhost:3000` (change to `https://yidvibe.com` in production).
- **Redirect URLs:** add `http://localhost:3000/**` (and `https://yidvibe.com/**` in production).

## 4. Test
Run the app (`npm run dev`), open http://localhost:3000/login, click
**Continue with Google**. On first sign-in a `profiles` row is created automatically
(via the `handle_new_user` DB trigger), and you land back signed in.

> In production (Vercel), set the same env vars and update the Site URL + redirect URLs
> to your live domain, and add the production origin to the Google credentials.
