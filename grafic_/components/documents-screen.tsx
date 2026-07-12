"use client"

import { useMemo, useState } from "react"
import { Paperclip, CircleCheckBig, Check, Sparkles } from "lucide-react"
import { StatusPill } from "@/components/status-pill"
import { requiredDocs, additionalDocs, type DocItem, type DocStatus } from "@/lib/app-data"
import { cn } from "@/lib/utils"

const statusTone: Record<DocStatus, "green" | "red" | "orange" | "blue" | "muted"> = {
  Прийнято: "green",
  Відхилено: "red",
  "На перевірці": "orange",
  Завантажено: "blue",
  "Не завантажено": "muted",
}

// Icon tint per status so the figure reflects the document state
const iconTone: Record<DocStatus, string> = {
  Прийнято: "bg-tg-green-bg text-tg-green",
  Відхилено: "bg-tg-red-bg text-tg-red",
  "На перевірці": "bg-tg-orange-bg text-tg-orange",
  Завантажено: "bg-tg-blue-bg text-tg-accent",
  "Не завантажено": "bg-tg-bg text-tg-muted",
}

// A document counts as "ready" once it is uploaded/verified/accepted
const isReady = (s: DocStatus) => s === "Прийнято" || s === "Завантажено" || s === "На перевірці"

interface DocState extends DocItem {
  id: string
}

function SuccessBar({ percent }: { percent: number }) {
  const complete = percent >= 100
  return (
    <div className="rounded-[20px] bg-tg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
            complete ? "bg-tg-green text-white" : "bg-tg-green-bg text-tg-green",
          )}
        >
          <CircleCheckBig className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-tg-text">Готовність документів</p>
          <p className="text-[13px] text-tg-muted">
            {complete ? "Усі документи готові!" : "Завантажте всі документи, щоб рухатись далі"}
          </p>
        </div>
        <span className="text-[22px] font-bold text-tg-green">{percent}%</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-tg-bg">
        <div
          className="h-full rounded-full bg-tg-green transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function DocCard({ doc, onUpload }: { doc: DocState; onUpload: (id: string) => void }) {
  const Icon = doc.icon
  const isDone = doc.status === "Прийнято"
  const needsUpload = doc.status === "Не завантажено" || doc.status === "Відхилено"
  return (
    <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "relative flex size-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
            iconTone[doc.status],
          )}
          aria-hidden="true"
        >
          <Icon className="size-[22px]" strokeWidth={1.8} />
          {isDone && (
            <span className="absolute -bottom-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-tg-green text-white ring-2 ring-tg-card">
              <Check className="size-3" strokeWidth={3} />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-medium leading-snug text-tg-text text-pretty">{doc.title}</p>
            <StatusPill label={doc.status} tone={statusTone[doc.status]} />
          </div>
          <button
            type="button"
            onClick={() => onUpload(doc.id)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[14px] font-medium text-tg-accent transition-opacity active:opacity-60"
          >
            <Paperclip className="size-4" aria-hidden="true" />
            {needsUpload ? "Завантажити" : "Замінити файл"}
          </button>
        </div>
      </div>
    </div>
  )
}

function DocGroup({
  title,
  docs,
  onUpload,
}: {
  title: string
  docs: DocState[]
  onUpload: (id: string) => void
}) {
  return (
    <section>
      <h2 className="px-1 pb-2 text-[13px] font-semibold uppercase tracking-wide text-tg-muted">{title}</h2>
      <div className="space-y-2.5">
        {docs.map((doc) => (
          <DocCard key={doc.id} doc={doc} onUpload={onUpload} />
        ))}
      </div>
    </section>
  )
}

export function DocumentsScreen({ onCelebrate }: { onCelebrate: () => void }) {
  const [docs, setDocs] = useState<DocState[]>(() => [
    ...requiredDocs.map((d, i) => ({ ...d, id: `req-${i}` })),
    ...additionalDocs.map((d, i) => ({ ...d, id: `add-${i}` })),
  ])

  const percent = useMemo(
    () => Math.round((docs.filter((d) => isReady(d.status)).length / docs.length) * 100),
    [docs],
  )
  const allReady = percent >= 100

  const markReady = (id: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "Прийнято" } : d)))

  const uploadAll = () => {
    setDocs((prev) => prev.map((d) => ({ ...d, status: "Прийнято" })))
    // let the progress bar animate to 100% before revealing the celebration
    setTimeout(onCelebrate, 650)
  }

  const required = docs.filter((d) => d.id.startsWith("req"))
  const additional = docs.filter((d) => d.id.startsWith("add"))

  return (
    <div className="space-y-6 px-4 py-4">
      <SuccessBar percent={percent} />

      <DocGroup title="Обов'язкові документи" docs={required} onUpload={markReady} />
      <DocGroup title="Додаткові документи" docs={additional} onUpload={markReady} />

      {/* Demo action: upload everything at once to preview the celebration */}
      <button
        type="button"
        onClick={allReady ? onCelebrate : uploadAll}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-tg-accent py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
      >
        <Sparkles className="size-5" aria-hidden="true" />
        {allReady ? "Переглянути привітання" : "Завантажити всі документи"}
      </button>
    </div>
  )
}
