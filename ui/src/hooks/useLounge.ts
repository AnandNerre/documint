import { useCallback, useEffect, useRef, useState } from 'react'

import { loungeWsUrl } from '@/lib/api'
import type { ChatMessage, LoungeSession, LoungeUser, PlatformStats } from '@/types'
import { loadLoungeSession, saveLoungeSession } from '@/types'

const EMPTY_STATS: PlatformStats = {
  active_users: 0,
  documents_parsed: 0,
  languages_seen: 0,
  messages_today: 0,
}

export function useLounge() {
  const [session, setSession] = useState<LoungeSession | null>(() => loadLoungeSession())
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState<LoungeUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS)
  const wsRef = useRef<WebSocket | null>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const join = useCallback(
    (name: string, email: string) => {
      const existing = loadLoungeSession()
      const payload = {
        type: 'join',
        name,
        email,
        session_id: existing?.sessionId,
      }
      send(payload)
      const next: LoungeSession = {
        sessionId: existing?.sessionId ?? '',
        name,
        email,
      }
      setSession(next)
      saveLoungeSession(next)
    },
    [send],
  )

  const sendMessage = useCallback(
    (body: string) => {
      send({ type: 'chat', body })
    },
    [send],
  )

  useEffect(() => {
    let alive = true
    let retry: ReturnType<typeof setTimeout>

    const connect = () => {
      const ws = new WebSocket(loungeWsUrl())
      wsRef.current = ws

      ws.onopen = () => {
        if (!alive) return
        setConnected(true)
        const saved = loadLoungeSession()
        if (saved?.name) {
          ws.send(
            JSON.stringify({
              type: 'join',
              name: saved.name,
              email: saved.email,
              session_id: saved.sessionId || undefined,
            }),
          )
        }
        pingRef.current = setInterval(() => {
          send({ type: 'ping' })
        }, 25_000)
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string)
          if (data.type === 'welcome') {
            const saved = loadLoungeSession()
            const next: LoungeSession = {
              sessionId: data.session_id,
              name: data.name ?? saved?.name ?? 'Guest',
              email: saved?.email ?? '',
            }
            saveLoungeSession(next)
            setSession(next)
          }
          if (data.type === 'presence') setUsers(data.users ?? [])
          if (data.type === 'stats') {
            setStats({
              active_users: data.active_users ?? 0,
              documents_parsed: data.documents_parsed ?? 0,
              languages_seen: data.languages_seen ?? 0,
              messages_today: data.messages_today ?? 0,
            })
          }
          if (data.type === 'history') setMessages(data.messages ?? [])
          if (data.type === 'chat') {
            setMessages((prev) => [
              ...prev,
              {
                id: data.id,
                name: data.name,
                body: data.body,
                created_at: data.created_at,
              },
            ])
          }
        } catch {
          /* ignore */
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (pingRef.current) clearInterval(pingRef.current)
        if (alive) retry = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      alive = false
      clearTimeout(retry)
      if (pingRef.current) clearInterval(pingRef.current)
      wsRef.current?.close()
    }
  }, [send])

  return { session, connected, users, messages, stats, join, sendMessage }
}
