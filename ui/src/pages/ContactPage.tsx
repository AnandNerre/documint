import { useState } from 'react'
import { Check, Mail, MapPin, Send } from 'lucide-react'

import { liveAppUrl, SITE } from '@/lib/site'
import { Card, PageShell, Prose } from '@/components/pages/PageShell'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')
    const message = String(form.get('message') ?? '')
    const subject = encodeURIComponent(`DocuMint contact from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <PageShell badge="Contact" title="Get in touch" subtitle="We read every message. Response within 2–3 business days.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold text-slate-900">Send a message</h2>
          {sent ? (
            <div className="mt-6 flex flex-col items-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold text-slate-900">Message received!</p>
              <p className="mt-1 text-sm text-slate-500">We'll get back to you soon at the email you provided.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input required name="name" placeholder="Your name" className="form-input w-full" />
              <input required name="email" type="email" placeholder="Your email" className="form-input w-full" />
              <textarea required name="message" rows={4} placeholder="How can we help?" className="form-input w-full resize-none" />
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">
                <Send className="h-4 w-4" /> Send message
              </button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-bold text-slate-900">Direct email</h2>
            <a href={`mailto:${SITE.email}`} className="mt-3 flex items-center gap-2 text-violet-600 hover:underline">
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
          </Card>
          <Card>
            <h2 className="font-bold text-slate-900">Office</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
              Remote-first team · HQ in {SITE.location}
              <br />
              Founded from {SITE.origin}
            </p>
          </Card>
          <Card>
            <h2 className="font-bold text-slate-900">Website</h2>
            <Prose>
              <p>
                Our free app on GitHub Pages:{' '}
                <a href={liveAppUrl()} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                  {liveAppUrl().replace('https://', '')}
                </a>
              </p>
            </Prose>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
