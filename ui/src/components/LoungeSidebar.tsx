import { useState } from 'react'
import { Languages, MessageCircle, Send, Sparkles, Users, Zap } from 'lucide-react'

import type { ChatMessage, LoungeUser, PlatformStats } from '@/types'

interface LoungeSidebarProps {
  connected: boolean
  sessionName: string | null
  users: LoungeUser[]
  messages: ChatMessage[]
  stats: PlatformStats
  onJoin: (name: string, email: string) => void
  onSend: (body: string) => void
}

export function LoungeSidebar({
  connected,
  sessionName,
  users,
  messages,
  stats,
  onJoin,
  onSend,
}: LoungeSidebarProps) {
  const [name, setName] = useState(sessionName ?? '')
  const [email, setEmail] = useState('')
  const [draft, setDraft] = useState('')

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onJoin(name.trim(), email.trim() || `${name.trim().toLowerCase().replace(/\s/g, '')}@payleaf.app`)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !sessionName) return
    onSend(draft.trim())
    setDraft('')
  }

  const online = users.filter((u) => u.online)

  return (
    <aside className="sidebar-panel flex h-full w-[300px] shrink-0 flex-col border-l border-white/5">
      <div className="border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">Live Lounge</p>
            <p className="text-[11px] text-slate-400">
              {connected ? 'Connected' : 'Reconnecting…'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-4">
        <StatChip icon={Users} label="Online" value={stats.active_users} />
        <StatChip icon={Zap} label="Parsed" value={stats.documents_parsed} />
        <StatChip icon={Languages} label="Languages" value={stats.languages_seen} />
        <StatChip icon={MessageCircle} label="Messages" value={stats.messages_today} />
      </div>

      {!sessionName ? (
        <form onSubmit={handleJoin} className="space-y-3 border-b border-white/5 px-4 pb-4">
          <p className="text-xs font-medium text-slate-300">Say hi — name &amp; email only</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="sidebar-input w-full"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            type="email"
            className="sidebar-input w-full"
          />
          <button type="submit" className="sidebar-btn w-full">
            Enter lounge
          </button>
        </form>
      ) : (
        <div className="border-b border-white/5 px-4 pb-3">
          <p className="text-xs text-slate-400">
            Signed in as <span className="font-semibold text-emerald-300">{sessionName}</span>
          </p>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Active now ({online.length})
        </p>
        <div className="max-h-28 space-y-1 overflow-y-auto">
          {online.length === 0 && (
            <p className="text-xs text-slate-500">No one else here yet — be first.</p>
          )}
          {online.map((u) => (
            <div key={u.session_id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="truncate text-xs text-slate-200">{u.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Messages
        </p>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-3">
          {messages.length === 0 && (
            <p className="text-xs leading-relaxed text-slate-500">
              Chat with others using Payleaf right now. Messages fade after 24h — nothing stored forever.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[11px] font-semibold text-emerald-300">{m.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{m.body}</p>
            </div>
          ))}
        </div>

        {sessionName && (
          <form onSubmit={handleSend} className="mb-4 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="sidebar-input min-w-0 flex-1"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-400 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </aside>
  )
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-white">{value}</p>
    </div>
  )
}
