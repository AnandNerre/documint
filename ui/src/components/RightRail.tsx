import { ChatPanel } from '@/components/ChatPanel'
import { NewsSidebar } from '@/components/NewsFeed'
import type { ChatMessage, LoungeUser, PlatformStats } from '@/types'

interface RightRailProps {
  connected: boolean
  sessionName: string | null
  users: LoungeUser[]
  messages: ChatMessage[]
  stats: PlatformStats
  onJoin: (name: string, email: string) => void
  onSend: (body: string) => void
}

export function RightRail({
  connected,
  sessionName,
  users,
  messages,
  stats,
  onJoin,
  onSend,
}: RightRailProps) {
  return (
    <aside className="right-rail sidebar-panel hidden shrink-0 flex-col border-l border-white/5 lg:flex">
      <div className="right-rail-chat min-h-0 flex-1">
        <ChatPanel
          connected={connected}
          sessionName={sessionName}
          users={users}
          messages={messages}
          onlineCount={stats.active_users}
          onJoin={onJoin}
          onSend={onSend}
        />
      </div>
      <div className="right-rail-news min-h-0 flex-1 border-t border-white/10">
        <NewsSidebar />
      </div>
    </aside>
  )
}
