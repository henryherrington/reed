# Reed — setup guide

This is a real Next.js app: Google sign-in, a shared Postgres database, everyone's
ratings visible to people who follow them. It replaces the old single-file
`marginalia.html` prototype.

Stack: Next.js 14 (App Router) + Auth.js (`next-auth` v4) + Prisma + Postgres,
deployed on Vercel.

## 1. Create a database

Pick one (both have generous free tiers):

- **Supabase** — supabase.com → New project → Settings → Database → copy the
  "Connection string" (URI, with the password filled in). Use the "Transaction"
  pooler string if offered, it works fine with Prisma for this app's scale.
- **Neon** — neon.tech → New project → copy the connection string from the
  dashboard.

You'll get something like:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```
That's your `DATABASE_URL`.

## 2. Create a Google OAuth client

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create
   a new project (top-left project dropdown → New project). Call it "Reed" or
   whatever you like.
2. In the left sidebar: **APIs & Services → OAuth consent screen**.
   - User type: **External** (unless you have a Google Workspace org you want to
     restrict to).
   - Fill in the app name ("Reed"), your email as support/developer contact.
   - Scopes: leave defaults (email, profile, openid).
   - Test users: while the app is unpublished, only emails you add here can sign
     in — add yourself and your friends here for now, or click "Publish app"
     later to open it to anyone (Google may require verification for a public
     app depending on scopes, but the defaults you're using here are exempt).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: "Reed".
   - **Authorized JavaScript origins** — add both:
     - `http://localhost:3000`
     - your production URL once you have it, e.g. `https://reed.vercel.app`
   - **Authorized redirect URIs** — add both:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://reed.vercel.app/api/auth/callback/google` (swap in your real domain)
   - Save. You'll get a **Client ID** and **Client secret** — that's
     `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

You can come back and add the production URLs after you deploy and know your
real domain — one client, multiple authorized origins, works for both dev and
prod at once.

## 3. Configure environment variables

```
cd reed-app
cp .env.example .env
```

Fill in `.env`:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...       # generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=...          # from step 1
```

(Using `.env` rather than Next.js's usual `.env.local` on purpose — the Prisma CLI only
reads `.env`, so keeping everything in one file avoids syncing two of them. Both are
gitignored either way.)

## 4. Install, migrate, run

```
npm install
npx prisma migrate dev --name init
npm run dev
```

Open `http://localhost:3000`, click "Sign in with Google" — you should land on
your empty library. Add a link, mark it read, rate it.

To test the friends/activity features, sign in as a second Google account (or
have a friend sign in), then on the Activity tab follow them by the email they
signed in with.

## 5. Deploy

Easiest path is Vercel:

1. Push this folder to a GitHub repo.
2. [vercel.com](https://vercel.com) → New Project → import the repo.
3. Add environment variables. Most are the same as `.env`, with two exceptions:
   - `NEXTAUTH_URL` → your Vercel URL, e.g. `https://reed.vercel.app`
   - `DATABASE_URL` → **don't reuse your local direct connection string here.**
     Vercel's serverless functions can't reach Supabase's direct connection
     (it's IPv6-only, Vercel is IPv4-only) and every sign-in will fail with a
     `Can't reach database server` error. Instead, grab the **pooler**
     connection string from Supabase → Connect → "Transaction pooler" tab
     (port 6543), and make sure `?pgbouncer=true` is on the end of it.
   - `DIRECT_URL` → your normal direct connection string (port 5432), same as
     locally. Migrations don't actually run on Vercel in this setup, but
     Prisma still needs the variable defined or the build fails.
4. Deploy.
5. Go back to Google Cloud Console → your OAuth client → add
   `https://reed.vercel.app` to authorized origins and
   `https://reed.vercel.app/api/auth/callback/google` to redirect URIs (if you
   didn't already in step 2).

Vercel automatically runs `npm run build`, which runs `prisma generate` first
(wired up in `package.json`).

## Notes on what's implemented

- Sign-in creates a `User` row automatically (via the Prisma adapter) the first
  time someone signs in with Google — no separate signup step.
- "Friends" is a simple one-directional follow: type someone's email on the
  Activity tab to follow them. They need to have signed in at least once first.
  There's no follow request/approval step yet — anyone can follow anyone whose
  email they know.
- Activity and Popular are scoped to you + people you follow, not everyone
  who's ever signed in.
- The poster art is still a flat placeholder color, not a real thumbnail —
  same caveat as before.

## A heads-up on this handoff

I wrote all of this by hand without being able to run `npm install` or
`next build` — this sandbox has no network access to the npm registry, so I
couldn't compile-check it before handing it over. The code follows
well-established patterns (this is a standard Auth.js + Prisma + App Router
setup) and I reviewed it carefully, but there's a real chance something needs
a small fix on first build. If `npm run dev` throws an error, paste it back to
me and I'll fix it.
