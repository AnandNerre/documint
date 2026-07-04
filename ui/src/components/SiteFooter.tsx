import { Layers, Mail } from 'lucide-react'

const LINKS = {
  product: [
    { label: 'How it works', href: '#how' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Support', href: '#contact' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Careers', href: '#careers' },
    { label: 'Press', href: '#press' },
    { label: 'Blog', href: '#blog' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'Contact', href: '#contact' },
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
                <p className="text-lg font-extrabold tracking-tight text-slate-900">DocuMint</p>
                <p className="text-[11px] font-medium text-slate-500">Document intelligence</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Read any document, any language. Extract fields, export clean spreadsheets — private and free.
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5" /> hello@documint.app
            </p>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {group === 'company' ? 'Company' : group === 'product' ? 'Product' : 'Legal'}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {items.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-violet-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DocuMint. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400">
            A <span className="font-medium text-slate-500">Yaworldu</span> company
          </p>
        </div>
      </div>
    </footer>
  )
}
