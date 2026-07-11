import { Paperclip, CircleCheckBig, Check } from "lucide-react"
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

function SuccessBar() {
  const allDocs = [...requiredDocs, ...additionalDocs]
  const accepted = allDocs.filter((d) => d.status === "Прийнято" || d.status === "Завантажено").length
  const percent = Math.round((accepted / allDocs.length) * 100)

  return (
    <div className="rounded-[20px] bg-tg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tg-green-bg text-tg-green">
          <CircleCheckBig className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-tg-text">Готовність документів</p>
          <p className="text-[13px] text-tg-muted">
            {accepted} з {allDocs.length} опрацьовано
          </p>
        </div>
        <span className="text-[22px] font-bold text-tg-green">{percent}%</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-tg-bg">
        <div
          className="h-full rounded-full bg-tg-green transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function DocCard({ doc }: { doc: DocItem }) {
  const Icon = doc.icon
  const isDone = doc.status === "Прийнято"
  return (
    <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={cn("relative flex size-11 shrink-0 items-center justify-center rounded-2xl", iconTone[doc.status])}
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
            className="mt-2.5 inline-flex items-center gap-1.5 text-[14px] font-medium text-tg-accent transition-opacity active:opacity-60"
          >
            <Paperclip className="size-4" aria-hidden="true" />
            {doc.status === "Не завантажено" ? "Завантажити" : "Замінити файл"}
          </button>
        </div>
      </div>
    </div>
  )
}

function DocGroup({ title, docs }: { title: string; docs: DocItem[] }) {
  return (
    <section>
      <h2 className="px-1 pb-2 text-[13px] font-semibold uppercase tracking-wide text-tg-muted">{title}</h2>
      <div className="space-y-2.5">
        {docs.map((doc) => (
          <DocCard key={doc.title} doc={doc} />
        ))}
      </div>
    </section>
  )
}

export function DocumentsScreen() {
  return (
    <div className="space-y-6 px-4 py-4">
      <SuccessBar />
      <DocGroup title="Обов'язкові документи" docs={requiredDocs} />
      <DocGroup title="Додаткові документи" docs={additionalDocs} />
    </div>
  )
}
