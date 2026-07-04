import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

import { BLOG_POSTS } from '@/lib/site'
import { Card, PageShell, Prose } from '@/components/pages/PageShell'

export function BlogPage() {
  return (
    <PageShell badge="Blog" title="Stories from Yaworldu" subtitle="Product updates, founder notes, and ideas we're thinking about.">
      <div className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <Card key={post.slug}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 font-bold text-violet-700">{post.tag}</span>
              <span className="text-slate-400">{post.date}</span>
              {'comingSoon' in post && post.comingSoon && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" /> Coming soon
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">
              {'comingSoon' in post && post.comingSoon ? (
                post.title
              ) : (
                <Link to={`/blog/${post.slug}`} className="hover:text-violet-600">
                  {post.title}
                </Link>
              )}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
            {!('comingSoon' in post && post.comingSoon) && (
              <Link to={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-violet-600 hover:underline">
                Read more →
              </Link>
            )}
          </Card>
        ))}
      </div>
      <Prose>
        <p className="mt-8 text-center text-sm text-slate-400">More posts launching soon.</p>
      </Prose>
    </PageShell>
  )
}
