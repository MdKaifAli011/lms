# Deployment (PM2 / self-hosted)

## Why the app can "crash" or show errors after deploy

The code can be fine, but **Next.js Server Actions use internal IDs that change with every build**. If the server restarts with a new build while users (or the browser) still have the old bundle:

- You get: **"Failed to find Server Action 'x'. This request might be from an older or newer deployment."**
- Pages that use RSC can return 500 or errors, so the app looks broken or "crashed."

So the issue is **deploy/restart timing**, not a bug in your app code.

## Fix: stable Server Action IDs + restart after deploy

### 1. Set a fixed encryption key (production)

Generate once:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to the environment where you run the app (e.g. `.env.production` or PM2 env):

```bash
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<paste-the-base64-key>
```

Use the **same** key for every instance and every deploy. This keeps Server Action IDs stable across restarts.

### 2. Restart PM2 after every deploy

After building, always restart so the running process uses the new build:

```bash
npm run build
pm2 restart lms-pub
```

### 3. Optional: full clean deploy

If things are still wrong:

```bash
rm -rf .next
npm run build
pm2 restart lms-pub
```

---

After this, the "Failed to find Server Action" errors should stop. Users may need a **refresh** once after a new deploy.
