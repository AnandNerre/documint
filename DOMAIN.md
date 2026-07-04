# Free website from India — $0, no US phone needed

**You do NOT need DigitalPlat** if you don't have a US number. Use these instead — all work from India with **+91 mobile** or **Gmail**.

| What | Free URL | Sign up with |
|------|----------|--------------|
| **DocuMint app (main)** | `https://documint.onrender.com` | GitHub + Gmail |
| **Company page** | `https://yaworldu.wixsite.com/documint` | Wix + **Indian mobile** |
| **Contact email** | Your Gmail (e.g. `you@gmail.com`) | Already have it |

**Total cost: ₹0** — no `.com`, no US phone, no credit card.

---

## Recommended path (India)

### 1. Deploy app on Render (5–10 min)

```powershell
.\deploy-free.ps1 -GitHubUser YOUR_GITHUB_USERNAME
```

- Sign up at [render.com](https://render.com) with **GitHub** (no phone needed)
- New → **Blueprint** → connect repo → **Apply**
- Live URL: **`https://documint.onrender.com`**

### 2. Wix company site (optional, 10 min)

1. [wix.com](https://wix.com) → sign up with **+91** Indian number
2. Site name: **Yaworldu**
3. Add button **Launch DocuMint** → `https://documint.onrender.com`
4. Free URL: `yaworldu.wixsite.com/documint`

### 3. Update your email on the site

Edit `ui/src/lib/site.ts` → set `email` to your **Gmail**:

```ts
email: 'yourname@gmail.com',
```

---

## Skip DigitalPlat (why)

DigitalPlat WHOIS form often asks for **US-style phone (+1)** in the registration fields. That is awkward from India.

**You don't need it.** `documint.onrender.com` is a real public HTTPS URL — share it anywhere (LinkedIn, resume, WhatsApp).

---

## Optional later: free custom domain (India)

If you still want a custom name later, try **`.dpdns.org`** (not `.us.kg` — that needs paid KYC):

1. [dash.domain.digitalplat.org](https://dash.domain.digitalplat.org)
2. Register **`documint.dpdns.org`**
3. WHOIS phone field: try **`+91-XXXXXXXXXX`** (your real Indian number in international format)
4. If the form only accepts +1, **skip it** — Render URL is enough

Then point DNS to Render (see below).

---

## Connect custom domain to Render (only if you got one)

| Type | Name | Value |
|------|------|-------|
| CNAME | `@` | `documint.onrender.com` |
| CNAME | `www` | `documint.onrender.com` |

Render → service → **Settings** → **Custom Domains** → add your domain.

---

## Quick start script

```powershell
.\setup-free-domain.ps1
```

Opens Render dashboard (India-friendly path).

---

## Summary

```
GitHub (free)     →  push code
Render (free)     →  documint.onrender.com   ← use this from India
Wix (free)        →  yaworldu.wixsite.com    ← +91 mobile OK
DigitalPlat       →  optional, skip if no US number
```
