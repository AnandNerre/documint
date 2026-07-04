import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ScrollToTop } from '@/components/ScrollToTop'
import { AppShell } from '@/components/layout/AppShell'
import { AboutPage } from '@/pages/AboutPage'
import { BlogPage } from '@/pages/BlogPage'
import { BlogPostPage } from '@/pages/BlogPostPage'
import { CareersPage } from '@/pages/CareersPage'
import { ContactPage } from '@/pages/ContactPage'
import { CookiesPage } from '@/pages/CookiesPage'
import { HomePage } from '@/pages/HomePage'
import { PressPage } from '@/pages/PressPage'
import { PricingPage } from '@/pages/PricingPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { useLounge } from '@/hooks/useLounge'
import { fetchHealth } from '@/lib/api'
import type { HealthResponse } from '@/types'

function ShellRoutes() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const lounge = useLounge()

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({
          status: 'offline',
          tesseract_available: false,
          parser: 'rule-based',
          pdf_text_available: true,
        }),
      )
  }, [])

  return (
    <Routes>
      <Route element={<AppShell health={health} lounge={lounge} />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cookies" element={<CookiesPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="press" element={<PressPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

  return (
    <BrowserRouter basename={basename === '/' ? undefined : basename}>
      <ScrollToTop />
      <ShellRoutes />
      <style>{`
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: white;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4); }
        .btn-primary:disabled { opacity: 0.6; }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 0.875rem; border: 1px solid #e2e8f0; background: white;
          padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: #334155;
          box-shadow: 0 1px 2px rgba(15,23,42,0.05); transition: background 0.15s;
        }
        .btn-secondary:hover { background: #f8fafc; }
        .form-input {
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
      `}</style>
    </BrowserRouter>
  )
}
