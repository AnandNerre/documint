import { Outlet } from 'react-router-dom'

import { NewsTicker } from '@/components/NewsFeed'
import { RightRail } from '@/components/RightRail'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import type { useLounge } from '@/hooks/useLounge'
import type { HealthResponse } from '@/types'

interface AppShellProps {
  health: HealthResponse | null
  lounge: ReturnType<typeof useLounge>
}

export function AppShell({ health, lounge }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="left-panel flex min-h-screen min-w-0 flex-1 flex-col">
        <NewsTicker />
        <SiteHeader health={health} />
        <main className="relative z-10 flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <Outlet context={{ health, lounge }} />
        </main>
        <SiteFooter />
      </div>

      <RightRail
        connected={lounge.connected}
        sessionName={lounge.session?.name ?? null}
        users={lounge.users}
        messages={lounge.messages}
        stats={lounge.stats}
        onJoin={lounge.join}
        onSend={lounge.sendMessage}
      />
    </div>
  )
}
