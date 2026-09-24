"""SQLite persistence layer for users, conversations, and messages.

Uses only the Python standard library (sqlite3) so no extra dependency is
required. The database file is created automatically at data/app.db (override
with the RAG_DB_PATH environment variable).
"""

import json
import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).parent.resolve()
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "app.db"
DB_PATH = Path(os.getenv("RAG_DB_PATH", str(DEFAULT_DB_PATH)))

_lock = threading.Lock()


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """Create tables and indexes if they do not exist."""
    with _lock, _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT,
                role TEXT NOT NULL DEFAULT 'employee',
                provider TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
            """
        )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def upsert_user(user_id: str, email: Optional[str], role: str, provider: str) -> None:
    with _lock, _connect() as conn:
        conn.execute(
            """
            INSERT INTO users (id, email, role, provider, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET email=excluded.email, role=excluded.role
            """,
            (user_id, email, role, provider, _now()),
        )


def create_conversation(user_id: str, title: Optional[str] = None) -> str:
    cid = uuid.uuid4().hex
    now = _now()
    with _lock, _connect() as conn:
        conn.execute(
            "INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (cid, user_id, title or "New Conversation", now, now),
        )
    return cid


def ensure_conversation(conversation_id: str, user_id: str, title: Optional[str] = None) -> None:
    """Create a conversation if it does not yet exist."""
    with _lock, _connect() as conn:
        row = conn.execute("SELECT id FROM conversations WHERE id=?", (conversation_id,)).fetchone()
        if row is None:
            now = _now()
            conn.execute(
                "INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (conversation_id, user_id, title or "New Conversation", now, now),
            )


def list_conversations(user_id: str) -> List[Dict[str, Any]]:
    with _lock, _connect() as conn:
        rows = conn.execute(
            "SELECT id, title, created_at, updated_at FROM conversations WHERE user_id=? ORDER BY updated_at DESC",
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    with _lock, _connect() as conn:
        row = conn.execute("SELECT * FROM conversations WHERE id=?", (conversation_id,)).fetchone()
    return dict(row) if row else None


def add_message(conversation_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    now = _now()
    with _lock, _connect() as conn:
        conn.execute(
            "INSERT INTO messages (conversation_id, role, content, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
            (conversation_id, role, content, json.dumps(metadata or {}), now),
        )
        conn.execute("UPDATE conversations SET updated_at=? WHERE id=?", (now, conversation_id))


def get_messages(conversation_id: str) -> List[Dict[str, Any]]:
    with _lock, _connect() as conn:
        rows = conn.execute(
            "SELECT id, role, content, metadata, created_at FROM messages WHERE conversation_id=? ORDER BY id ASC",
            (conversation_id,),
        ).fetchall()
    out: List[Dict[str, Any]] = []
    for r in rows:
        d = dict(r)
        try:
            d["metadata"] = json.loads(d["metadata"] or "{}")
        except json.JSONDecodeError:
            d["metadata"] = {}
        out.append(d)
    return out
