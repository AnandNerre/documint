import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

import { SITE } from '@/lib/site'
import { Card, PageShell, Prose } from '@/components/pages/PageShell'

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    highlight: true,
    features: [
      'Unlimited document uploads',
      'Any language auto-detection',
      'Excel export',
      'Community chat lounge',
      'Live news feed',
      'No account required',
    ],
  },
  {
    name: 'Pro',
    price: 'Coming soon',
    period: '',
    highlight: false,
    features: [
      'Batch processing',
      'API access',
      'Custom field templates',
      'Priority support',
      'Team workspaces',
    ],
  },
]

export function PricingPage() {
  return (
    <PageShell
      badge="Pricing"
      title="Simple, honest pricing"
      subtitle="DocuMint is free today because everyone deserves access. Pro features are on the way."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlight ? 'ring-2 ring-violet-500 ring-offset-2' : ''}
          >
            {plan.highlight && (
              <span className="mb-3 inline-block rounded-full bg-violet-600 px-3 py-0.5 text-xs font-bold text-white">
                Most popular
              </span>
            )}
            <h2 className="text-2xl font-extrabold text-slate-900">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
              {plan.period && <span className="text-slate-500"> / {plan.period}</span>}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.highlight ? (
              <Link to="/" className="mt-6 block rounded-xl bg-violet-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500">
                Start free now
              </Link>
            ) : (
              <p className="mt-6 text-center text-xs font-medium text-slate-400">Launching soon — stay tuned</p>
            )}
          </Card>
        ))}
      </div>
      <Prose>
        <p className="mt-8 text-center text-sm">
          Questions? <Link to="/contact" className="text-violet-600 hover:underline">Contact us</Link> or email {SITE.email}
        </p>
      </Prose>
    </PageShell>
  )
}
