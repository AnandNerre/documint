import { Briefcase, MapPin, Clock } from 'lucide-react'

import { SITE } from '@/lib/site'
import { Card, PageShell, Prose } from '@/components/pages/PageShell'

const ROLES = [
  {
    title: 'Senior Frontend Engineer',
    location: 'Remote / Bangalore',
    type: 'Full-time',
    status: 'Open',
    desc: 'Help us make DocuMint the best document experience on the web.',
  },
  {
    title: 'ML / OCR Engineer',
    location: 'Remote',
    type: 'Full-time',
    status: 'Coming soon',
    desc: 'Improve extraction accuracy across languages and layouts.',
  },
  {
    title: 'Community Manager',
    location: 'Remote',
    type: 'Part-time',
    status: 'Coming soon',
    desc: 'Grow our live lounge and help users around the world.',
  },
]

export function CareersPage() {
  return (
    <PageShell
      badge="Careers"
      title="Join Yaworldu"
      subtitle="We're a small team building tools that help millions read documents for free."
    >
      <Prose>
        <p>
          {SITE.company} is early-stage and growing. We hire people who care about privacy, accessibility, and
          building products that matter — especially for people who do not have access to expensive software.
        </p>
      </Prose>

      <div className="mt-8 space-y-4">
        {ROLES.map((role) => (
          <Card key={role.title}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{role.title}</h2>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {role.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {role.type}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{role.desc}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  role.status === 'Open'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {role.status}
              </span>
            </div>
            {role.status === 'Open' ? (
              <a
                href={`mailto:${SITE.email}?subject=Application: ${role.title}`}
                className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
              >
                Apply now
              </a>
            ) : (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" /> Applications open soon — check back or email us to express interest
              </p>
            )}
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
