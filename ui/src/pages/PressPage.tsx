import { liveAppUrl, SITE } from '@/lib/site'
import { Card, ComingSoonBanner, PageShell, Prose } from '@/components/pages/PageShell'

export function PressPage() {
  return (
    <PageShell badge="Press" title="Press & media" subtitle="News, announcements, and brand assets for journalists.">
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Latest</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{SITE.company} launches {SITE.product}</h2>
        <p className="mt-2 text-sm text-slate-500">March 2026</p>
        <Prose>
          <p className="mt-4">
            {SITE.company} today announced {SITE.product}, a free document intelligence tool that reads any PDF or
            image, detects language automatically, and exports structured data to Excel. Built with privacy at
            its core, the product targets users worldwide who need affordable alternatives to expensive document
            software.
          </p>
          <p>
            <strong>Media contact:</strong>{' '}
            <a href={`mailto:${SITE.email}`} className="text-violet-600 hover:underline">{SITE.email}</a>
          </p>
        </Prose>
      </Card>

      <ComingSoonBanner label="Press kit" />

      <Card className="mt-4">
        <h2 className="font-bold text-slate-900">Brand</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Product: {SITE.product}</li>
          <li>Company: {SITE.company}</li>
          <li>App: {liveAppUrl().replace('https://', '')}</li>
          <li>Company: {SITE.company}</li>
          <li>HQ: {SITE.location}</li>
        </ul>
      </Card>
    </PageShell>
  )
}
