"""Ephemeral lounge — active users & live chat. Nothing persisted long-term."""

from __future__ import annotations

import asyncio
import time
import uuid
from collections import deque
from dataclasses import dataclass, field

from fastapi import WebSocket

_PRESENCE_TTL = 120
_MESSAGE_TTL = 86_400
_MAX_MESSAGES = 200


@dataclass
class LoungeUser:
    session_id: str
    name: str
    email: str
    connected_at: float = field(default_factory=time.time)
    last_seen: float = field(default_factory=time.time)


@dataclass
class ChatMessage:
    id: str
    session_id: str
    name: str
    body: str
    created_at: float = field(default_factory=time.time)


class LoungeManager:
    def __init__(self) -> None:
        self._connections: dict[str, WebSocket] = {}
        self._users: dict[str, LoungeUser] = {}
        self._messages: deque[ChatMessage] = deque(maxlen=_MAX_MESSAGES)
        self.documents_parsed: int = 0
        self._languages_seen: set[str] = set()
        self._lock = asyncio.Lock()

    def record_document(self, language_code: str) -> None:
        self.documents_parsed += 1
        if language_code and language_code != "unknown":
            self._languages_seen.add(language_code)

    def stats(self) -> dict:
        self._prune()
        return {
            "active_users": len(self._connections),
            "documents_parsed": self.documents_parsed,
            "languages_seen": len(self._languages_seen),
            "messages_today": len(self._messages),
        }

    def _prune(self) -> None:
        now = time.time()
        stale = [sid for sid, u in self._users.items() if now - u.last_seen > _PRESENCE_TTL]
        for sid in stale:
            if sid not in self._connections:
                self._users.pop(sid, None)
        while self._messages and now - self._messages[0].created_at > _MESSAGE_TTL:
            self._messages.popleft()

    def active_users(self) -> list[dict]:
        self._prune()
        users = sorted(
            self._users.values(),
            key=lambda u: u.last_seen,
            reverse=True,
        )
        return [
            {
                "session_id": u.session_id,
                "name": u.name,
                "online": u.session_id in self._connections,
            }
            for u in users
        ]

    def recent_messages(self) -> list[dict]:
        self._prune()
        return [
            {
                "id": m.id,
                "name": m.name,
                "body": m.body,
                "created_at": m.created_at,
            }
            for m in self._messages
        ]

    async def connect(self, websocket: WebSocket, session_id: str | None, name: str, email: str) -> str:
        sid = session_id or str(uuid.uuid4())
        display = (name or "Guest").strip()[:40] or "Guest"
        email_clean = (email or f"{sid[:8]}@guest.local").strip()[:80]

        async with self._lock:
            self._connections[sid] = websocket
            self._users[sid] = LoungeUser(session_id=sid, name=display, email=email_clean)

        await self._send(websocket, {"type": "welcome", "session_id": sid, "name": display})
        await self._broadcast_presence()
        await self._broadcast_stats()
        await websocket.send_json({"type": "history", "messages": self.recent_messages()})
        return sid

    async def disconnect(self, session_id: str) -> None:
        async with self._lock:
            self._connections.pop(session_id, None)
            if session_id in self._users:
                self._users[session_id].last_seen = time.time()
        await self._broadcast_presence()
        await self._broadcast_stats()

    async def heartbeat(self, session_id: str) -> None:
        if session_id in self._users:
            self._users[session_id].last_seen = time.time()

    async def handle_chat(self, session_id: str, body: str) -> None:
        user = self._users.get(session_id)
        if not user:
            return
        text = body.strip()[:500]
        if not text:
            return
        msg = ChatMessage(
            id=str(uuid.uuid4())[:8],
            session_id=session_id,
            name=user.name,
            body=text,
        )
        self._messages.append(msg)
        payload = {
            "type": "chat",
            "id": msg.id,
            "name": msg.name,
            "body": msg.body,
            "created_at": msg.created_at,
        }
        await self._broadcast(payload)

    async def _send(self, websocket: WebSocket, payload: dict) -> None:
        try:
            await websocket.send_json(payload)
        except Exception:
            pass

    async def _broadcast(self, payload: dict) -> None:
        dead: list[str] = []
        for sid, ws in list(self._connections.items()):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(sid)
        for sid in dead:
            self._connections.pop(sid, None)

    async def _broadcast_presence(self) -> None:
        await self._broadcast({"type": "presence", "users": self.active_users()})

    async def _broadcast_stats(self) -> None:
        await self._broadcast({"type": "stats", **self.stats()})


lounge = LoungeManager()
