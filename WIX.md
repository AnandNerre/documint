# Wix company site + DocuMint app

**Yaworldu** = parent company (Wix marketing site — About, Careers)  
**DocuMint** = the document app (runs on Render)

Users see **DocuMint** in the app. Yaworldu only appears as a small footer line: *"A Yaworldu company"*.

---

## Setup

| Piece | Where | URL example |
|-------|-------|-------------|
| Company site | [Wix](https://wix.com) free | `yaworldu.wixsite.com` |
| DocuMint app | [Render](https://render.com) free | `documint.onrender.com` or `app.yaworldu.qzz.io` |

### Wix (Yaworldu company pages)

1. Create site at [wix.com](https://wix.com) — name it **Yaworldu**
2. Pages: Home, About, Careers, Contact
3. Add button **Launch DocuMint** → link to your Render URL

### Render (DocuMint app)

See [DEPLOY.md](DEPLOY.md) — push repo to GitHub, deploy Blueprint.

### Optional: embed app in Wix

```html
<iframe
  src="https://YOUR-RENDER-URL.onrender.com"
  width="100%"
  height="900"
  style="border:none;border-radius:12px;"
  title="DocuMint"
></iframe>
```

---

**Total cost: $0**
