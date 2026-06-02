# Enabling admin "Invite user" (and user deletion)

Most of the admin panel works out of the box. Two actions — **inviting/creating accounts** and **fully deleting a user** — need Supabase's **service-role key**, because creating or deleting a login can't be done with the public key.

Until you add the key, the admin panel shows those actions but they return a friendly "not enabled yet" message. Everything else (verify, feature, make admin, content management, posting, moderation) works without it.

## One-time setup (~2 minutes)

1. **Get the service-role key**
   - Supabase dashboard → your project (`lqfqkivbxeexmrxuxefi`) → **Project Settings → API**.
   - Under **Project API keys**, copy the **`service_role`** secret (NOT the `anon`/publishable one). Treat it like a password — it bypasses Row Level Security.

2. **Add it to Vercel**
   - Vercel → the **`yidvibe`** project → **Settings → Environment Variables**.
   - Add a new variable:
     - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
     - **Value:** *(paste the service_role key)*
     - **Environments:** check **Production** (and Preview if you want it on branch deploys).
   - Save.

3. **Redeploy** so the new env var is picked up
   - Vercel → **Deployments → ⋯ on the latest → Redeploy** (or just push any commit).

That's it. The admin **Users → Invite user** button will now send an email invite, and **Remove user** becomes available.

## Security notes
- The key is only ever read **server-side** (in `src/lib/supabase/admin.ts`, which is `server-only`). It is never sent to the browser.
- Don't paste it into client code, commit it, or share it. If it leaks, rotate it in Supabase (API settings) and update the Vercel variable.
