"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatMessages, manager, type ChatMessage } from "@/lib/app-data"

function Bubble({ msg }: { msg: ChatMessage }) {
  const isClient = msg.from === "client"
  return (
    <div className={cn("flex", isClient ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm",
          isClient
            ? "rounded-br-md bg-tg-accent text-white"
            : "rounded-bl-md bg-tg-card text-tg-text",
        )}
      >
        <p className="text-[14px] leading-relaxed text-pretty">{msg.text}</p>
        <p className={cn("mt-1 text-right text-[11px]", isClient ? "text-white/70" : "text-tg-muted")}>{msg.time}</p>
      </div>
    </div>
  )
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages)
  const [draft, setDraft] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send() {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    setMessages((prev) => [...prev, { id: Date.now(), from: "client", text, time }])
    setDraft("")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Manager identity strip */}
      <div className="flex shrink-0 items-center gap-3 border-b border-tg-border bg-tg-card px-4 py-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-tg-accent text-[15px] font-semibold text-white">
          {manager.name.split(" ").map((w) => w[0]).join("")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-tg-text">{manager.name}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-tg-green">
            <span className="size-1.5 rounded-full bg-tg-green" aria-hidden="true" />
            {manager.online ? "онлайн" : "офлайн"} · {manager.role}
          </p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        <p className="mx-auto w-fit rounded-full bg-tg-card px-3 py-1 text-[11px] font-medium text-tg-muted shadow-sm">
          Сьогодні
        </p>
        {messages.map((msg) => (
          <Bubble key={msg.id} msg={msg} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div
        className="flex shrink-0 items-end gap-2 border-t border-tg-border bg-tg-card px-3 py-2.5"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          aria-label="Прикріпити файл"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-tg-muted transition-colors active:bg-tg-bg"
        >
          <Paperclip className="size-5" aria-hidden="true" />
        </button>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          placeholder="Повідомлення…"
          className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl bg-tg-bg px-3.5 py-2.5 text-[14px] leading-snug text-tg-text placeholder:text-tg-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Надіслати"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tg-accent text-white transition-opacity active:scale-95 disabled:opacity-40"
        >
          <Send className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
