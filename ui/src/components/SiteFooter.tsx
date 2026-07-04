import { Link } from 'react-router-dom'
import { Globe2, Layers, Mail, MapPin } from 'lucide-react'

import { liveAppUrl, SITE } from '@/lib/site'

const LINKS = {
  product: [
    { label: 'DocuMint', to: '/' },
    { label: 'How it works', to: '/#how' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Security', to: '/privacy' },
  ],
  company: [
    { label: 'About Yaworldu', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Blog', to: '/blog' },
  ],
  legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
    { label: 'Contact', to: '/contact' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="px-6 py-12 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900">{SITE.product}</p>
                <p className="text-[11px] font-medium text-slate-500">Document intelligence</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Read any document, any language. Free, private, and built to help everyone.
            </p>
            <div className="mt-4 space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> {SITE.email}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {SITE.location}
              </p>
              <a
                href={liveAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-violet-600 hover:underline"
              >
                <Globe2 className="h-3.5 w-3.5" /> {liveAppUrl().replace('https://', '')}
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {group === 'company' ? 'Company' : group === 'product' ? 'Product' : 'Legal'}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {items.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-slate-600 transition hover:text-violet-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} {SITE.company}. All rights reserved.</p>
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{SITE.product}</span> by{' '}
            <span className="font-semibold text-slate-600">{SITE.company}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
