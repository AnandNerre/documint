import { Link } from 'react-router-dom'

import { SITE } from '@/lib/site'
import { PageShell, Prose } from '@/components/pages/PageShell'

export function PrivacyPage() {
  return (
    <PageShell badge="Legal" title="Privacy Policy" subtitle="Last updated: March 2026">
      <Prose>
        <p>
          {SITE.company} ("we", "us") operates {SITE.product}. This policy explains how we handle your information
          when you use our service.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Documents you upload</h2>
        <p>
          Files are processed in memory to extract text and fields. We do <strong>not</strong> permanently store
          your uploaded documents on our servers. Once processing completes, file data is discarded.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Chat lounge</h2>
        <p>
          Messages in the community chat are temporary (typically removed within 24 hours). Do not share sensitive
          personal information in public chat.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Contact form</h2>
        <p>
          If you contact us, we use your name and email only to respond to your inquiry.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Cookies</h2>
        <p>
          See our <Link to="/cookies" className="text-violet-600 hover:underline">Cookie Policy</Link> for details on
          local storage and session data.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Contact</h2>
        <p>
          Questions: <a href={`mailto:${SITE.email}`} className="text-violet-600 hover:underline">{SITE.email}</a>
        </p>
      </Prose>
    </PageShell>
  )
}
