/** Public site constants — GitHub Pages only (no Render/Wix/DigitalPlat) */

export const SITE = {
  product: 'DocuMint',
  company: 'Yaworldu',
  /** GitHub Pages project site — replace YOUR_USERNAME after first deploy */
  githubRepo: 'documint',
  /** Shown in footer; runtime URL used when app is open */
  appUrl: 'https://YOUR_USERNAME.github.io/documint',
  email: 'hello@yaworldu.wixsite.com',
  location: 'Bangalore, India',
  origin: 'Madanapalle, Andhra Pradesh',
} as const

/** Live URL when running on GitHub Pages (or localhost) */
export function liveAppUrl(): string {
  if (typeof window !== 'undefined') {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return `${window.location.origin}${base}`
  }
  return SITE.appUrl
}

export const BLOG_POSTS = [
  {
    slug: 'from-madanapalle-to-documint',
    title: 'From a village in Madanapalle to building DocuMint in Bangalore',
    date: 'March 2026',
    author: 'Nerre Kumar',
    excerpt:
      'How a kid from Madanapalle became a senior data engineer in Bangalore — and why I started Yaworldu to help people read any document for free.',
    tag: 'Founder story',
  },
  {
    slug: 'why-privacy-matters',
    title: 'Why we never store your documents',
    date: 'February 2026',
    author: 'DocuMint Team',
    excerpt: 'Privacy is not a feature for us — it is the foundation. Here is how DocuMint keeps your files safe.',
    tag: 'Privacy',
    comingSoon: true,
  },
] as const
