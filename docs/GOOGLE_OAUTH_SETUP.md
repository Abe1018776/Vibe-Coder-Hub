# Enabling Google sign-in (one-time, ~5 minutes)

The app's sign-in code is complete. Google sign-in only needs OAuth credentials,
which **you** create in Google Cloud and paste into Supabase. No code changes.

---

## ⭐ Make sign-in look trustworthy (fix the "to continue to lqfq…supabase.co" / scam look)

That scary URL appears because the Google OAuth app has **no branding set**, so Google
falls back to showing the raw Supabase callback domain. Setting the app name + logo makes
Google show **"YidVibe"** with your logo instead. This is dashboard-only — paste these exact
values:

1. [console.cloud.google.com](https://console.cloud.google.com) → your project →
   **APIs & Services → OAuth consent screen** (newer console: **Branding**).
2. Fill in **exactly**:
   - **App name:** `YidVibe`
   - **User support email:** `elimelechmoster@gmail.com`
   - **App logo:** upload **`public/brand/google-oauth-logo.png`** (a square 256×256 PNG I
     generated for this — grab it from the repo folder, or after a deploy from
     `https://yidvibe.vercel.app/brand/google-oauth-logo.png`).
   - **Application home page:** `https://yidvibe.vercel.app` (→ `https://yidvibe.com` later)
   - **Developer contact email:** `elimelechmoster@gmail.com`
   - **Authorized domains:** leave empty for now on the `vercel.app` URL (you can't verify a
     domain you don't own); add `yidvibe.com` here once its DNS is live.
3. **Publishing status → PUBLISH APP** (move from "Testing" → "In production"). With only the
   basic scopes (email, profile, openid) this needs **no** verification review — the **app
   name shows immediately**. *(The logo may show an "unverified app" state until Google's
   optional brand verification; the name alone already removes the scam feel.)*

**Result:** the account chooser reads **"Choose an account to continue to YidVibe"** with your
logo, instead of the raw supabase.co URL.

> Want the literal URL to read `auth.yidvibe.com`? That's the paid route: Supabase **Custom
> Auth Domain** add-on (~$10/mo) + `yidvibe.com` connected via DNS, then re-point the Google
> redirect URI to it. Optional polish on top of the free branding above.

Also confirm, while you're in the dashboards (so prod OAuth works):
- **Google → Credentials → your OAuth client → Authorized JavaScript origins:** add
  `https://yidvibe.vercel.app`. (Authorized redirect URI stays the supabase.co callback below.)
- **Supabase → Authentication → URL Configuration → Site URL:** `https://yidvibe.vercel.app`;
  **Redirect URLs:** add `https://yidvibe.vercel.app/**`.

---

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
