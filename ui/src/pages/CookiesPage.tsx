import { Link } from 'react-router-dom'

import { SITE } from '@/lib/site'
import { PageShell, Prose } from '@/components/pages/PageShell'

export function CookiesPage() {
  return (
    <PageShell badge="Legal" title="Cookie Policy" subtitle="Last updated: March 2026">
      <Prose>
        <p>{SITE.product} uses minimal cookies and browser storage to keep the app working.</p>
        <h2 className="text-lg font-bold text-slate-900">What we store</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Chat session</strong> — localStorage keeps your lounge name so you stay signed in during your
            visit
          </li>
          <li>
            <strong>Preferences</strong> — currency and display settings in your browser session
          </li>
        </ul>
        <h2 className="text-lg font-bold text-slate-900">What we do not use</h2>
        <p>
          We do not use third-party advertising cookies or sell your data to advertisers.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Managing cookies</h2>
        <p>
          You can clear site data in your browser settings at any time. Clearing data will reset your chat lounge
          session.
        </p>
        <p>
          Questions: <Link to="/contact" className="text-violet-600 hover:underline">Contact us</Link>
        </p>
      </Prose>
    </PageShell>
  )
}
