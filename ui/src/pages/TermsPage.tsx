import { SITE } from '@/lib/site'
import { PageShell, Prose } from '@/components/pages/PageShell'

export function TermsPage() {
  return (
    <PageShell badge="Legal" title="Terms of Service" subtitle="Last updated: March 2026">
      <Prose>
        <p>By using {SITE.product}, you agree to these terms.</p>
        <h2 className="text-lg font-bold text-slate-900">Use of service</h2>
        <p>
          {SITE.product} is provided free of charge for personal and lawful use. You may not use the service to
          process illegal content or attempt to disrupt the platform.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Accuracy</h2>
        <p>
          OCR and field extraction may contain errors. Always review extracted data before relying on it for
          financial, legal, or employment decisions.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Availability</h2>
        <p>
          We strive for high uptime but do not guarantee uninterrupted service. Features may change as we improve
          the product.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Limitation of liability</h2>
        <p>
          {SITE.product} is provided "as is" without warranties. {SITE.company} is not liable for damages arising
          from use of the service.
        </p>
        <p>
          Contact: <a href={`mailto:${SITE.email}`} className="text-violet-600 hover:underline">{SITE.email}</a>
        </p>
      </Prose>
    </PageShell>
  )
}
