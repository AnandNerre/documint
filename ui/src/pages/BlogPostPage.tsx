import { Link, useParams } from 'react-router-dom'

import { SITE } from '@/lib/site'
import { PageShell, Prose } from '@/components/pages/PageShell'

export function BlogPostPage() {
  const { slug } = useParams()

  if (slug !== 'from-madanapalle-to-documint') {
    return (
      <PageShell title="Post not found">
        <Link to="/blog" className="text-violet-600 hover:underline">← Back to blog</Link>
      </PageShell>
    )
  }

  return (
    <PageShell
      badge="Founder story"
      title="From a village in Madanapalle to building DocuMint in Bangalore"
      subtitle="By Nerre Kumar · March 2026"
    >
      <Prose>
        <p>
          I grew up in <strong>Madanapalle</strong> — a small town in Andhra Pradesh, surrounded by hills and
          mango orchards. It is not the kind of place people associate with tech startups. But it is where I
          learned that hard work and curiosity can take you anywhere.
        </p>
        <p>
          Today I work in <strong>Bangalore</strong> as a <strong>senior data engineer</strong>. I build systems
          that process millions of records, design pipelines, and solve problems at scale. But every time I saw
          friends and family struggle with payslips, tax forms, or random PDFs — taking screenshots, retyping
          numbers, paying for tools they could not afford — I kept thinking: <em>there has to be a better way.</em>
        </p>
        <h2 className="text-lg font-bold text-slate-900">Why I started {SITE.company}</h2>
        <p>
          {SITE.company} is my first company. Not a big corporation — just a name for the things I want to build
          to help people. The first product is <strong>{SITE.product}</strong>: upload any document, any language,
          get structured data back, export to Excel. Free. Private. No signup walls.
        </p>
        <p>
          I wanted something my parents could use. Something a student in Madanapalle could use. Something a
          freelancer in Lagos or São Paulo could use. Documents are universal — the tools to read them should be
          too.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Privacy is personal</h2>
        <p>
          Growing up, we did not have the luxury of trusting random apps with our paperwork. So {SITE.product} never
          stores your files. Everything runs in your session and disappears. That is not marketing — that is how
          I would want my own payslip handled.
        </p>
        <h2 className="text-lg font-bold text-slate-900">What is next</h2>
        <p>
          We are just getting started. More languages, better accuracy, mobile apps, and tools beyond documents.
          But the mission stays the same: <strong>build technology that helps real people</strong> — starting with
          the ones who need it most.
        </p>
        <p>
          If this story resonates, try {SITE.product}. If you want to help build it, check our{' '}
          <Link to="/careers" className="text-violet-600 hover:underline">careers page</Link>. And if you just want
          to say hi, <Link to="/contact" className="text-violet-600 hover:underline">reach out</Link>.
        </p>
        <p className="text-slate-400">— Nerre Kumar, Founder</p>
      </Prose>
      <Link to="/blog" className="mt-8 inline-flex text-sm font-semibold text-violet-600 hover:underline">
        ← All posts
      </Link>
    </PageShell>
  )
}
