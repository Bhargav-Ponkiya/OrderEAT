# Setup & Deploy Guide

**Start here when you open this project on a new machine.** This single guide covers everything: local setup → run locally → push to GitHub → CI → deploy backend → deploy frontend → wire CORS. Tick each box as you go.

---

## Pre-requisites (one-time per machine)

- **Node 20+** — Node 22 used in development (`.nvmrc` provided). `nvm install && nvm use` picks it up automatically.
- A **MongoDB Atlas** account with a free M0 cluster and a connection string (`mongodb+srv://...`).
- A **GitHub** account.
- A **Vercel** account (free) for the frontend.
- A **Render** account (free) for the backend.
- Optional: the **`gh` CLI** if you want one-command repo creation.

---

## 0. Local setup (verify the transfer is clean)

- [ ] Folder transferred, opened in editor on main system
- [ ] `node --version` is 20+ (Node 22 used in development — see `.nvmrc`)
- [ ] Copy `server/.env.example` to `server/.env`, set `MONGODB_URI` (your existing Atlas string)
- [ ] Copy `client/.env.example` to `client/.env` (default `VITE_API_BASE_URL=http://localhost:4000` works)
- [ ] From repo root: `npm install` (installs both workspaces)
- [ ] `npm run lint` → clean
- [ ] `npm run typecheck` → clean
- [ ] `npm test` → all green (server tests use in-memory Mongo; client tests are unit/component)
- [ ] `npm run build` → builds both
- [ ] `npm run dev` → http://localhost:5173 loads menu, http://localhost:4000/api/health returns ok

If anything fails here, fix it **before** pushing.

---

## 1. Git: initialize + first commit

```bash
git init
git add -A
git commit -m "feat: order management — Express + MongoDB + React+Vite (FR-MENU, FR-CART, FR-ORDER, FR-STATUS)"
```

- [ ] Repo initialized
- [ ] First commit created
- [ ] `git status` clean
- [ ] No `.env` files committed (`git ls-files | grep -i env` should only show `.env.example`)

---

## 2. GitHub: create public repo + push

**Option A — `gh` CLI:**
```bash
gh repo create OrderEAT --public --source=. --push
```

**Option B — github.com first, then:**
```bash
git remote add origin git@github.com:<user>/OrderEAT.git
git branch -M main
git push -u origin main
```

- [ ] Public repo created
- [ ] `main` branch pushed
- [ ] Repo URL: `___________________________________________`

---

## 3. CI: confirm green check

- [ ] Open Actions tab on GitHub
- [ ] Wait for the `CI` workflow (~3–5 min — installs and tests both workspaces)
- [ ] Workflow shows **green ✓**

Fix locally, push, repeat if it fails.

---

## 4. Backend deploy (Render)

1. Go to https://render.com → New → **Web Service**
2. Connect the GitHub repo
3. Configure:
   - **Name**: `ordereat-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
4. **Environment** → add:
   - `MONGODB_URI` = your Atlas connection string
   - `ALLOWED_ORIGINS` = leave blank for now (we'll fill in after Vercel is up — defaults to localhost while we wait)
5. Click **Create Web Service**
6. Wait for first build (~2–4 min)
7. Once deployed, hit `https://<your-service>.onrender.com/api/health` — should return `{"ok": true, ...}`

- [ ] Render service created
- [ ] Build green
- [ ] `/api/health` returns 200
- [ ] Render URL: `___________________________________________`

> ⚠️ Render free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s.

---

## 5. Frontend deploy (Vercel)

1. Go to https://vercel.com/new → import the GitHub repo
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
3. **Environment Variables** → add:
   - `VITE_API_BASE_URL` = your Render URL from step 4 (no trailing slash)
4. Click **Deploy**
5. Wait for build (~1 min)
6. Open the production URL — menu should load (it fetches from Render)

- [ ] Vercel project created
- [ ] Build green
- [ ] Production URL loads menu
- [ ] Vercel URL: `___________________________________________`

---

## 6. Wire CORS back to Render

1. Go back to Render → your service → **Environment**
2. Set `ALLOWED_ORIGINS` = your Vercel URL (e.g. `https://ordereat.vercel.app`)
3. **Manual Deploy** → **Restart Service**
4. Reload the Vercel app — menu still loads, ordering still works

- [ ] `ALLOWED_ORIGINS` updated
- [ ] Render restarted
- [ ] Place a test order on production — SSE updates work

---

## 7. README: fix the placeholders

Open `README.md` and replace:

- [ ] CI badge: replace `USER/REPO` with your actual `<github-username>/<repo>` (appears in the badge line)
- [ ] **Live demo:** your Vercel URL
- [ ] **API:** your Render URL

---

## 8. Push the cleanup commit

```bash
git add README.md
git commit -m "docs: add deployed URLs and CI badge"
git push
```

- [ ] Pushed
- [ ] CI re-runs and stays green
- [ ] README badge renders correctly

---

## 9. Final Checklist

- [ ] GitHub URL ready
- [ ] Vercel URL ready
- [ ] Production app tested and functional

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm install` peer-dep errors | Wrong Node version | `nvm install && nvm use` (picks up `.nvmrc`) |
| Server tests hang on first run | mongodb-memory-server downloading Mongo binary | First run takes ~30s; subsequent runs use the cached binary |
| `MONGODB_URI is required` on server start | Missing `.env` | Copy `server/.env.example` to `server/.env`, set `MONGODB_URI` |
| Atlas connection times out | IP not allowlisted | In Atlas: Network Access → Add IP → "Allow Access from Anywhere" (0.0.0.0/0) for the demo |
| Client shows "Failed to load menu" | API base wrong or server down | Check `client/.env` `VITE_API_BASE_URL`; hit `/api/health` directly |
| CORS error in browser console | `ALLOWED_ORIGINS` missing the Vercel URL | Set it on Render, restart the service |
| Render service "spinning down" | Free tier sleep | Expected. Wakes up in ~30s on next request. |
| SSE not updating in production | Render free tier killed the long connection | Hit `/api/health` to wake; SSE reconnects automatically via `EventSource` |
