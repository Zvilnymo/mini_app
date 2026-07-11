"use client"

import { useState } from "react"
import { ChevronLeft, MoreVertical, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { TabBar, type TabKey } from "@/components/tab-bar"
import { HomeScreen } from "@/components/home-screen"
import { CabinetScreen } from "@/components/cabinet-screen"
import { DocumentsScreen } from "@/components/documents-screen"
import { ConferencesScreen } from "@/components/conferences-screen"
import { ChatScreen } from "@/components/chat-screen"

const titles: Record<TabKey, string> = {
  home: "Головна",
  cabinet: "Кабінет",
  documents: "Документи",
  chat: "Чат з менеджером",
  conferences: "Зустрічі",
}

export default function Page() {
  const [tab, setTab] = useState<TabKey>("home")
  const [dark, setDark] = useState(false)
  const [emptyConf, setEmptyConf] = useState(false)

  return (
    <main className="flex min-h-dvh flex-col items-center gap-5 bg-neutral-100 px-4 py-6 md:py-10">
      {/* Preview controls (not part of the Mini App UI) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {dark ? "Світла тема" : "Темна тема"}
        </button>
        {tab === "conferences" && (
          <button
            type="button"
            onClick={() => setEmptyConf((e) => !e)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
          >
            {emptyConf ? "Показати список" : "Порожній стан"}
          </button>
        )}
      </div>

      {/* Phone frame */}
      <div
        className={cn(
          "flex h-[812px] w-full max-w-[390px] flex-col overflow-hidden rounded-[36px] border-[10px] border-neutral-900 bg-tg-bg text-tg-text shadow-2xl",
          dark && "tg-dark",
        )}
      >
        {/* Telegram-style header */}
        <header className="flex shrink-0 items-center gap-2 bg-tg-card px-3 pb-3 pt-4">
          <button
            type="button"
            aria-label="Назад"
            className="flex size-9 items-center justify-center rounded-full text-tg-accent transition-colors active:bg-tg-bg"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-semibold leading-tight text-tg-text">{titles[tab]}</h1>
            <p className="text-[12px] leading-tight text-tg-muted">Юридична допомога · онлайн</p>
          </div>
          <button
            type="button"
            aria-label="Меню"
            className="flex size-9 items-center justify-center rounded-full text-tg-muted transition-colors active:bg-tg-bg"
          >
            <MoreVertical className="size-5" aria-hidden="true" />
          </button>
        </header>

        {/* Screen content — chat manages its own scroll, others scroll normally */}
        {tab === "chat" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatScreen />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {tab === "home" && <HomeScreen onNavigate={setTab} />}
            {tab === "cabinet" && <CabinetScreen />}
            {tab === "documents" && <DocumentsScreen />}
            {tab === "conferences" && <ConferencesScreen empty={emptyConf} />}
          </div>
        )}

        {/* Bottom tab bar */}
        <div className="shrink-0">
          <TabBar active={tab} onChange={setTab} />
        </div>
      </div>
    </main>
  )
}
