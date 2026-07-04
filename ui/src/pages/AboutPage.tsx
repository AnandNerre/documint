import { Link } from 'react-router-dom'
import { SITE } from '@/lib/site'
import { Card, PageShell, Prose } from '@/components/pages/PageShell'

export function AboutPage() {
  return (
    <PageShell
      badge="About"
      title={`About ${SITE.company}`}
      subtitle="Building tools that help real people — starting with documents."
    >
      <Prose>
        <p>
          <strong>{SITE.company}</strong> is a small technology company focused on one idea: everyone deserves
          access to smart, private software — no matter where they come from or what language they speak.
        </p>
        <p>
          Our first product, <strong>{SITE.product}</strong>, reads any document (PDF, photo, scan), detects the
          language automatically, extracts the important fields, and lets you export a clean spreadsheet. Free.
        </p>
      </Prose>

      <Card className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Our story</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {SITE.company} was started from {SITE.origin} — a town in Andhra Pradesh — by someone who moved to{' '}
          {SITE.location} to work as a senior data engineer. The goal was simple: build the first product that
          genuinely helps people deal with paperwork, payslips, invoices, and forms without paying for expensive
          tools or giving up their privacy.
        </p>
        <Link
          to="/blog/from-madanapalle-to-documint"
          className="mt-4 inline-flex text-sm font-semibold text-violet-600 hover:underline"
        >
          Read the founder story →
        </Link>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg font-bold text-slate-900">What we believe</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
          <li>Privacy first — your documents are yours</li>
          <li>Free tools for everyone, not just enterprises</li>
          <li>Any language, any country, any format</li>
          <li>Technology should feel human, not corporate</li>
        </ul>
      </Card>
    </PageShell>
  )
}
