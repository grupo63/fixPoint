"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { API } from "@/config";

/* ==================== DEBUG HELPERS ==================== */
const DEBUG = true;
const TAG = "🟩 [THREAD]";
function log(...args: any[]) {
  if (DEBUG) console.log(TAG, ...args);
}
function group(label: string) {
  if (DEBUG) console.groupCollapsed(`${TAG} ${label}`);
}
function groupEnd() {
  if (DEBUG) console.groupEnd();
}
async function fetchJSON(
  url: string,
  options: RequestInit & { __tag?: string } = {}
) {
  const t = options.__tag ? ` ${options.__tag}` : "";
  const method = (options.method || "GET").toUpperCase();
  log(`→ ${method}${t}:`, url);
  const res = await fetch(url, options);
  const ct = res.headers.get("content-type") || "";
  let data: any = null;
  let text: string | null = null;
  try {
    if (ct.includes("application/json")) data = await res.json();
    else text = await res.text();
  } catch {}
  log(`← ${method}${t}:`, url, "status:", res.status, data ?? text);
  return { ok: res.ok, status: res.status, data, text };
}

/* ==================== Tipos ==================== */
type Msg = {
  id: string;
  content: string;
  senderId?: string;
  createdAt?: string;
  isRead?: boolean;
};

type MinimalUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  name?: string | null;
  email?: string | null;
  profileImage?: string | null;
  imageUrl?: string | null;
  avatarUrl?: string | null;
  profileImg?: string | null;
};

type ConversationLite = {
  id?: string;
  conversationId?: string;
  clientId?: string;
  professionalId?: string;
  client?: MinimalUser | null;
  clientUser?: MinimalUser | null;
  professional?:
    | { id?: string; user?: MinimalUser | null; name?: string | null }
    | MinimalUser
    | null;
  professionalUser?: MinimalUser | null;
  participants?: MinimalUser[];
  participantIds?: string[];
};

/* ==================== Utils ==================== */
function coerceUser(x: any): MinimalUser | null {
  if (!x) return null;
  if (typeof x === "string") return { displayName: x };
  if (x && typeof x === "object" && x.user && typeof x.user === "object") {
    return coerceUser(x.user);
  }
  return {
    id: x.id ?? x.userId ?? undefined,
    firstName: x.firstName ?? null,
    lastName: x.lastName ?? null,
    fullName: x.fullName ?? x.name ?? null,
    displayName: x.displayName ?? x.name ?? x.fullName ?? null,
    email: x.email ?? null,
    profileImage:
      x.profileImage ?? x.imageUrl ?? x.avatarUrl ?? x.profileImg ?? null,
    imageUrl: x.imageUrl ?? null,
    avatarUrl: x.avatarUrl ?? null,
    profileImg: x.profileImg ?? null,
    name: x.name ?? null,
  };
}
const pickNiceName = (u?: MinimalUser | null, fb = "Usuario") =>
  u
    ? u.displayName ||
      u.fullName ||
      u.name ||
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
      u.email ||
      fb
    : fb;

function normalizeMessages(resp: unknown): Msg[] {
  if (Array.isArray(resp)) return resp as Msg[];
  if (resp && typeof resp === "object") {
    const obj = resp as any;
    const candidate =
      obj.items ?? obj.data ?? obj.results ?? obj.messages ?? [];
    return Array.isArray(candidate) ? (candidate as Msg[]) : [];
  }
  return [];
}

/* ==================== Fetch helpers ==================== */
async function fetchUserBrief(userId: string, token: string) {
  const r = await fetchJSON(`${API}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    __tag: "[users/:id]",
  });
  if (!r.ok) {
    log("users/:id NO OK →", r.status, "userId:", userId);
    return null;
  }
  const u = coerceUser(r.data);
  return {
    name: pickNiceName(u, `Usuario (${userId.slice(-4)})`),
    avatar:
      u?.profileImage || u?.imageUrl || u?.avatarUrl || u?.profileImg || "",
    _from: "users/:id" as const,
  };
}
async function fetchProfessionalSmart(proIdOrUserId: string, token: string) {
  // 1) entidad professional
  {
    const r = await fetchJSON(`${API}/professionals/${proIdOrUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      __tag: "[professionals/:id]",
    });
    if (r.ok) {
      const p = r.data;
      const u = coerceUser(p?.user ?? null);
      return {
        name:
          p?.name ||
          pickNiceName(u, `Profesional (${String(proIdOrUserId).slice(-4)})`),
        avatar:
          p?.profileImg ||
          u?.profileImage ||
          u?.imageUrl ||
          u?.avatarUrl ||
          "",
        _from: "professionals/:id" as const,
      };
    }
  }
  // 2) por userId
  const tryUrls = [
    { url: `${API}/professionals/by-user/${proIdOrUserId}`, tag: "[by-user/:userId]" },
    { url: `${API}/professionals?userId=${proIdOrUserId}`, tag: "[?userId=]" },
    { url: `${API}/professionals?user=${proIdOrUserId}`, tag: "[?user=]" },
  ];
  for (const { url, tag } of tryUrls) {
    const r = await fetchJSON(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      __tag: tag,
    });
    if (!r.ok) continue;
    const p = Array.isArray(r.data)
      ? r.data[0]
      : (r.data?.items?.[0] ?? r.data?.data?.[0] ?? r.data);
    if (!p) continue;
    const u = coerceUser(p?.user ?? null);
    return {
      name:
        p?.name ||
        pickNiceName(u, `Profesional (${String(proIdOrUserId).slice(-4)})`),
      avatar:
        p?.profileImg ||
        u?.profileImage ||
        u?.imageUrl ||
        u?.avatarUrl ||
        "",
      _from: tag as const,
    };
  }
  // 3) listar y filtrar por user.id
  {
    const r = await fetchJSON(`${API}/professionals`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      __tag: "[professionals list]",
    });
    if (r.ok) {
      const arr: any[] = Array.isArray(r.data)
        ? r.data
        : (r.data?.items ?? r.data?.data ?? r.data ?? []);
      const p = arr.find((x) => x?.user?.id === proIdOrUserId);
      if (p) {
        const u = coerceUser(p?.user ?? null);
        return {
          name:
            p?.name ||
            pickNiceName(u, `Profesional (${String(proIdOrUserId).slice(-4)})`),
          avatar:
            p?.profileImg ||
            u?.profileImage ||
            u?.imageUrl ||
            u?.avatarUrl ||
            "",
          _from: "professionals(list)+filter(user.id)" as const,
        };
      }
    }
  }
  log("❌ No pude resolver professional con ningún endpoint para:", proIdOrUserId);
  return null;
}

/* ==================== Página hilo ==================== */
export default function ChatThreadPage() {
  const { user, token } = useAuth() as any;
  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId as string;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [peerName, setPeerName] = useState<string>("Chat");
  const [peerAvatar, setPeerAvatar] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const myId = user?.id as string | undefined;
  const role = (user?.role || "").toString().toUpperCase();
  const iAmPro = role === "PROFESSIONAL" || Boolean(user?.professionalId);

  function getPeerUserIdFromConv(c: ConversationLite) {
    if (Array.isArray(c.participantIds) && c.participantIds.length) {
      const other = c.participantIds.find((id) => id && id !== myId);
      if (other) return other;
    }
    if (Array.isArray(c.participants) && c.participants.length) {
      const other = c.participants.find((p) => p?.id && p.id !== myId);
      if (other?.id) return other.id;
    }
    const cu = coerceUser(c.clientUser ?? c.client);
    if (cu?.id && cu.id !== myId) return cu.id;
    const pu =
      (typeof c.professional === "object" && c.professional && "user" in c.professional
        ? (c.professional as any).user
        : c.professional) ?? null;
    const puU = coerceUser(c.professionalUser ?? pu);
    if (puU?.id && puU.id !== myId) return puU.id;
    return null;
  }

  async function loadMessages() {
    group("loadMessages()");
    try {
      const r = await fetchJSON(`${API}/inbox/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        __tag: "[messages/:convId]",
      });
      if (!r.ok) return;
      const list = normalizeMessages(r.data).sort((a, b) => {
        const ta = new Date(a.createdAt ?? 0).getTime();
        const tb = new Date(b.createdAt ?? 0).getTime();
        return ta - tb;
      });
      log("msgs normalized:", list);
      setMessages(list);
      await ensurePeerFromLastMessage(list);
    } finally {
      groupEnd();
    }
  }

  async function loadPeerHeader() {
    group("loadPeerHeader()");
    try {
      const r = await fetchJSON(`${API}/inbox/conversations/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        __tag: "[mine]",
      });
      if (!r.ok) return;

      const raw = r.data;
      const list: ConversationLite[] = Array.isArray(raw)
        ? raw
        : (raw.items ?? raw.data ?? raw.results ?? raw.conversations ?? []);
      const conv =
        list.find(
          (c) => c.conversationId === conversationId || c.id === conversationId
        ) ?? null;

      log("mine -> conv found:", conv);

      if (!conv) return;

      if (iAmPro) {
        const clientUserId =
          coerceUser(conv.clientUser ?? conv.client)?.id ?? conv.clientId;
        if (clientUserId) {
          const info = await fetchUserBrief(clientUserId, token);
          if (info) {
            setPeerName(info.name);
            setPeerAvatar(info.avatar);
            log("header set via users/:id (client)", info);
            return;
          } else {
            log("users/:id (client) → NO ACCESS");
          }
        }
        const peerUserId = getPeerUserIdFromConv(conv);
        if (peerUserId) {
          const info = await fetchUserBrief(peerUserId, token);
          if (info) {
            setPeerName(info.name);
            setPeerAvatar(info.avatar);
            log("header set via users/:id (peerUserId)", info);
          } else {
            log("users/:id (peerUserId) → NO ACCESS");
          }
        }
      } else {
        const professionalEntityOrUserId =
          (typeof conv.professional === "object" && conv.professional
            ? (conv.professional as any).id
            : undefined) ?? conv.professionalId;

        if (professionalEntityOrUserId) {
          const info = await fetchProfessionalSmart(
            professionalEntityOrUserId,
            token
          );
          if (info) {
            setPeerName(info.name);
            setPeerAvatar(info.avatar);
            log("header set via professionals*", info);
            return;
          }
        }
        const peerUserId = getPeerUserIdFromConv(conv);
        if (peerUserId) {
          const info = await fetchUserBrief(peerUserId, token);
          if (info) {
            setPeerName(info.name);
            setPeerAvatar(info.avatar);
            log("header set via users/:id (peerUserId)", info);
          } else {
            log("users/:id (peerUserId) → NO ACCESS");
          }
        }
      }
    } finally {
      groupEnd();
    }
  }

  // Fallback adicional: tomar el último mensaje y tratar de resolver
  async function ensurePeerFromLastMessage(msgs: Msg[]) {
    if (!msgs.length || !API || !token) return;
    if (peerName !== "Chat") return;

    const last = msgs[msgs.length - 1];
    log("ensurePeerFromLastMessage last:", last);
    if (last.senderId && last.senderId !== myId) {
      const info = await fetchUserBrief(last.senderId, token);
      if (info) {
        setPeerName(info.name);
        if (!peerAvatar) setPeerAvatar(info.avatar);
        log("header set via users/:id (lastMessage.senderId)", info);
      } else {
        log("users/:id (lastMessage.senderId) → NO ACCESS");
      }
    }
  }

  useEffect(() => {
    loadMessages();
    loadPeerHeader();
    const id = setInterval(loadMessages, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!conversationId) return;
    const input = (e.currentTarget as HTMLFormElement).querySelector(
      "input[name=content]"
    ) as HTMLInputElement | null;
    const content = input?.value?.trim();
    if (!content) return;
    const r = await fetchJSON(`${API}/inbox/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, content }),
      __tag: "[POST /inbox/messages]",
    });
    if (r.ok && input) {
      input.value = "";
      await loadMessages();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
        {peerAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={peerAvatar}
            alt={peerName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center">
            {peerName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <h1 className="text-lg font-semibold">{peerName}</h1>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m) => {
          const isMe = m.senderId === myId;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p>{m.content}</p>
                <span className="block text-[10px] opacity-70 mt-1">
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t flex gap-2 bg-white">
        <input
          type="text"
          name="content"
          placeholder="Escribe un mensaje…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Enviar
        </button>
      </form>
    </div>
  );
}
