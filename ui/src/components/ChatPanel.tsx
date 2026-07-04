import { useState } from 'react'
import { MessageCircle, Send, Users } from 'lucide-react'

import { isClientOnly } from '@/lib/api'
import type { ChatMessage, LoungeUser } from '@/types'

interface ChatPanelProps {
  connected: boolean
  sessionName: string | null
  users: LoungeUser[]
  messages: ChatMessage[]
  onlineCount: number
  onJoin: (name: string, email: string) => void
  onSend: (body: string) => void
}

export function ChatPanel({
  connected,
  sessionName,
  users,
  messages,
  onlineCount,
  onJoin,
  onSend,
}: ChatPanelProps) {
  const [name, setName] = useState(sessionName ?? '')
  const [email, setEmail] = useState('')
  const [draft, setDraft] = useState('')

  const online = users.filter((u) => u.online)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onJoin(name.trim(), email.trim() || `${name.trim().toLowerCase().replace(/\s/g, '')}@guest.local`)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !sessionName) return
    onSend(draft.trim())
    setDraft('')
  }

  const browserOnly = isClientOnly()

  return (
    <div className="flex h-full min-h-0 flex-col">
      {browserOnly && (
        <p className="border-b border-white/5 bg-slate-800/80 px-4 py-2 text-[11px] leading-relaxed text-slate-400">
          GitHub Pages mode — documents are processed in your browser. Live chat needs a self-hosted server.
        </p>
      )}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Community Chat</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/20">
          <Users className="h-3 w-3" />
          {onlineCount} online
        </span>
      </div>

      {!browserOnly && !sessionName ? (
        <form onSubmit={handleJoin} className="space-y-2.5 border-b border-white/5 p-4">
          <p className="text-[11px] text-slate-400">Join with name &amp; email — no password</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="sidebar-input w-full" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" className="sidebar-input w-full" />
          <button type="submit" className="sidebar-btn w-full">Join chat</button>
        </form>
      ) : !browserOnly && sessionName ? (
        <div className="border-b border-white/5 px-4 py-2.5">
          <p className="text-[11px] text-slate-400">
            Hi, <span className="font-semibold text-emerald-300">{sessionName}</span>
          </p>
        </div>
      ) : null}

      {online.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/5 px-4 py-2">
          {online.slice(0, 8).map((u) => (
            <span key={u.session_id} className="flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {u.name}
            </span>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-xs leading-relaxed text-slate-500">
            {browserOnly
              ? 'Document upload works in the main panel — your files stay on your device.'
              : connected
                ? 'Say hello to others using DocuMint.'
                : 'Connecting…'}
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-emerald-300">{m.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{m.body}</p>
          </div>
        ))}
      </div>

      {!browserOnly && sessionName && (
        <form onSubmit={handleSend} className="flex gap-2 border-t border-white/5 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            className="sidebar-input min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  )
}
