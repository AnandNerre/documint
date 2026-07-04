# DocuMint on GitHub Pages — GitHub only, $0

**One platform. One free URL. No Render, Wix, or DigitalPlat.**

Your live URL will be:

```
https://YOUR_GITHUB_USERNAME.github.io/
```

Use a repo named **`YOUR_GITHUB_USERNAME.github.io`** for the shortest link (no `/documint` path).

Or with a project repo named `documint`:

```
https://YOUR_GITHUB_USERNAME.github.io/documint/
```

---

## How it works

| Feature | GitHub Pages |
|---------|----------------|
| Website URL | `username.github.io/documint` |
| About, Careers, Blog, etc. | Yes |
| Upload PDF / image | Yes — runs **in your browser** |
| OCR & parsing | Yes — Tesseract.js + pdf.js |
| Excel export | Yes — in browser |
| Live chat | Off on GitHub Pages (needs a server) |
| Cost | **₹0** |

Files never leave your device on GitHub Pages — processing is 100% client-side.

---

## Deploy in 3 steps

### 1. Create GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Repository name: **`documint`**
3. Public → **Create repository**

### 2. Push code

```powershell
cd c:\Users\nerre.kumar\payleaf
git add .
git commit -m "GitHub Pages deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/documint.git
git push -u origin main
```

Or run:

```powershell
.\deploy-github.ps1 -GitHubUser YOUR_USERNAME
```

### 3. Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Wait 2–3 min — workflow runs automatically
4. Open **`https://YOUR_USERNAME.github.io/documint/`**

---

## Local dev

```powershell
.\start-dev.ps1
```

Uses Python API locally (full chat + server OCR).

To test GitHub Pages mode locally:

```powershell
cd ui
$env:VITE_CLIENT_ONLY="true"
$env:VITE_BASE_PATH="/documint/"
npm run dev
```

---

## Optional: user site URL

If you name the repo **`YOUR_USERNAME.github.io`**, your app lives at:

```
https://YOUR_USERNAME.github.io/
```

Change `VITE_BASE_PATH` in `.github/workflows/github-pages.yml` to `/`.

---

## Self-host with Python API (optional)

For live chat + server OCR, run locally or on any Docker host:

```powershell
.\start-dev.ps1
```

GitHub Pages = browser-only. Self-host = full features.
