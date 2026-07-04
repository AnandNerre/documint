# Deploy DocuMint for free

You do **not** need a server, app store, or credit card for most of this. Everything below is **$0/month** on the free tier.

DocuMint ships as **one Docker container** (website + API + OCR). Easiest path: **GitHub + Render**.

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

---

## Free custom domain (DigitalPlat FreeDomain)

Yes — you can use [DigitalPlat FreeDomain](https://github.com/DigitalPlatDev/FreeDomain) to get a **free domain** for Yaworldu instead of only `payleaf.onrender.com` or `yaworldu.wixsite.com`.

**Dashboard:** [domain.digitalplat.org](https://domain.digitalplat.org)

### Available extensions (free)

| Extension | Example for Yaworldu |
|-----------|----------------------|
| `.qzz.io` | `yaworldu.qzz.io` |
| `.us.kg` | `yaworldu.us.kg` |
| `.dpdns.org` | `yaworldu.dpdns.org` |
| `.xx.kg` | `yaworldu.xx.kg` |
| `.qd.je` | `yaworldu.qd.je` |

These are real DNS domains — not as well-known as `.com`, but **free** and fine for a startup project. The project is maintained by the [DigitalPlat Foundation](https://github.com/DigitalPlatDev/FreeDomain) and used by 500k+ registrations.

### How to connect to Render (after app is deployed)

1. **Register domain** at [domain.digitalplat.org](https://domain.digitalplat.org)  
   Pick something like `yaworldu.qzz.io`

2. **In DigitalPlat DNS settings**, add:
   | Type | Name | Value |
   |------|------|-------|
   | `CNAME` | `@` or `www` | `your-app-name.onrender.com` |

   (Exact UI may vary — some extensions use Cloudflare or FreeDNS; follow their dashboard tutorial.)

3. **In Render dashboard** → your Payleaf service → **Settings** → **Custom Domains**  
   Add `yaworldu.qzz.io` (your chosen domain)

4. **Update Render env** (optional):
   ```
   CORS_ORIGINS=https://yaworldu.qzz.io
   ```

5. Wait 5–30 min for DNS to propagate. Your app will be at `https://yaworldu.qzz.io`

### Wix + free domain together

| Piece | URL |
|-------|-----|
| Company marketing site | Wix → `yaworldu.wixsite.com` **or** point free domain to Wix |
| Payleaf app | Render + free domain → `app.yaworldu.qzz.io` or root domain |

You can use a **subdomain** pattern:
- `yaworldu.qzz.io` → Wix (company home)
- `app.yaworldu.qzz.io` → Render (Payleaf app)

### Things to know

| Good | Caveat |
|------|--------|
| $0, no credit card | Not `.com` — some users may find `.qzz.io` less familiar |
| Works with Render HTTPS | Free tiers can have usage/abuse policies — use legitimately |
| 500k+ people use it | Renewal rules — check [DigitalPlat FAQ](https://github.com/DigitalPlatDev/FreeDomain) on their site |

**Security:** DigitalPlat warns their old Telegram was compromised — use only the [official dashboard](https://domain.digitalplat.org) and [GitHub repo](https://github.com/DigitalPlatDev/FreeDomain), not random Telegram promos.

