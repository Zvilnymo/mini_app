"use client"

import { Home, FileText, MessageCircle, Video, User } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabKey = "home" | "documents" | "chat" | "conferences" | "cabinet"

const tabs: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "home", label: "Головна", icon: Home },
  { key: "documents", label: "Документи", icon: FileText },
  { key: "chat", label: "Чат", icon: MessageCircle },
  { key: "conferences", label: "Зустрічі", icon: Video },
  { key: "cabinet", label: "Кабінет", icon: User },
]

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (key: TabKey) => void
}) {
  return (
    <nav
      aria-label="Головна навігація"
      className="border-t border-tg-border bg-tg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 px-0.5 py-2 transition-colors duration-150 active:scale-[0.96]",
                  isActive ? "text-tg-accent" : "text-tg-muted",
                )}
              >
                <Icon className="size-[22px]" strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
