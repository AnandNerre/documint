# Deploy Payleaf for free

You do **not** need a server, app store, or credit card for most of this. Everything below is **$0/month** on the free tier.

Payleaf ships as **one Docker container** (website + API + OCR). Easiest path: **GitHub + Render**.

---

## Option A — Render.com (recommended, ~10 minutes)

**What you get:** A public URL like `https://payleaf-xxxx.onrender.com` — share it with anyone.

**What you need (all free):**
- [GitHub](https://github.com) account
- [Render](https://render.com) account

### Steps

1. **Push Payleaf to GitHub**
   ```powershell
   cd c:\Users\nerre.kumar\payleaf
   git add .
   git commit -m "Add free deploy config"
   git remote add origin https://github.com/YOUR_USERNAME/payleaf.git
   git push -u origin main
   ```
   (Create an empty repo on GitHub first if you don't have one.)

2. **Deploy on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click **New +** → **Blueprint**
   - Connect your GitHub account
   - Select the `payleaf` repo
   - Render reads `render.yaml` automatically
   - Click **Apply** — wait 5–10 min for the first build

3. **Open your app**
   - Render shows a URL like `https://payleaf.onrender.com`
   - That's your live Payleaf — UI, chat lounge, and document upload all work

### Free tier notes (Render)

| | |
|---|---|
| Cost | $0 |
| Sleep | App sleeps after ~15 min idle — first visit may take 30–60 sec to wake |
| OCR | Tesseract + Poppler included in Docker image |
| Chat | WebSocket lounge works between all visitors |

---

## Option B — Fly.io (alternative free host)

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/)
2. Sign up at [fly.io](https://fly.io) (free allowance)
3. From the project folder:
   ```powershell
   cd c:\Users\nerre.kumar\payleaf
   fly launch --no-deploy
   fly deploy
   ```
4. Your app URL: `https://payleaf.fly.dev` (or the name you pick)

`fly.toml` is already in the repo.

---

## Option C — Cloudflare Pages + Render API (split, also free)

Use this if you want the **fastest** page loads (CDN) with API on Render.

1. Deploy API on Render as above, but change `render.yaml` to set `SERVE_STATIC: "false"` (or deploy API-only Dockerfile)
2. Deploy UI to [Cloudflare Pages](https://pages.cloudflare.com):
   - Connect GitHub repo
   - Build command: `cd ui && npm ci && npm run build`
   - Output directory: `ui/dist`
   - Environment variable: `VITE_API_BASE=https://YOUR-RENDER-URL.onrender.com`
   - Environment variable: `VITE_WS_URL=wss://YOUR-RENDER-URL.onrender.com/ws/lounge`
3. Set Render env `CORS_ORIGINS` to your Cloudflare URL

**Option A (single Render deploy) is simpler** — start there.

---

## Test Docker locally before deploying

```powershell
cd c:\Users\nerre.kumar\payleaf
docker build -t payleaf .
docker run -p 8000:8000 -e SERVE_STATIC=true -e PORT=8000 payleaf
```

Open **http://localhost:8000**

---

## What does NOT work on free static-only hosts

These hosts are **free** but **cannot** run Payleaf's OCR backend:

| Host | Why |
|------|-----|
| GitHub Pages | Static files only — no Python/OCR |
| Netlify (static) | Same |
| Vercel (static only) | Same |

You need **Docker** hosting (Render, Fly.io) for full features.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| First load very slow | Render free tier waking up — wait ~60 sec |
| Build fails | Check Render logs; ensure `Dockerfile` is at repo root |
| Chat not connecting | Use `https://` URL (not `http://`) in production |
| CORS error (split deploy) | Set `CORS_ORIGINS` on Render to your frontend URL |

---

## Summary

```
GitHub (free)  →  push code
Render (free)  →  New Blueprint → connect repo → live URL
```

No server to buy. No app store. Share the Render URL and anyone can use Payleaf.
