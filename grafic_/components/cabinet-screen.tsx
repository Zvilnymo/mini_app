import { Check, User, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { caseInfo, caseSteps, payments } from "@/lib/app-data"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="px-1 pb-2 text-[13px] font-semibold uppercase tracking-wide text-tg-muted">{children}</h2>
}

function HeroCard() {
  const done = caseSteps.filter((s) => s.state === "done").length
  const current = caseSteps.findIndex((s) => s.state === "current")
  const progress = Math.round(((current >= 0 ? current : done) / (caseSteps.length - 1)) * 100)

  return (
    <div className="relative overflow-hidden rounded-[20px] p-5 text-white shadow-lg shadow-tg-accent/25">
      <div className="absolute inset-0 bg-gradient-to-br from-tg-accent to-tg-accent-strong" aria-hidden="true" />
      <div className="relative">
        <p className="text-[13px] font-medium text-white/80">{caseInfo.caseNumber}</p>
        <p className="mt-1 text-[20px] font-semibold leading-tight text-balance">{caseInfo.clientName}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-medium backdrop-blur">
            <span className="size-2 rounded-full bg-white" aria-hidden="true" />
            {caseInfo.statusLabel}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] text-white/80">
            <span>Прогрес справи</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stepper() {
  return (
    <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
      <ol className="relative">
        {caseSteps.map((step, i) => {
          const isLast = i === caseSteps.length - 1
          const isDone = step.state === "done"
          const isCurrent = step.state === "current"
          return (
            <li key={step.label} className="relative flex gap-3.5 pb-5 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-14px)] w-0.5 -translate-x-1/2",
                    isDone ? "bg-tg-green" : "bg-tg-border",
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                  isDone && "bg-tg-green text-white",
                  isCurrent && "bg-tg-accent text-white ring-4 ring-tg-accent/20",
                  !isDone && !isCurrent && "bg-tg-bg text-tg-muted",
                )}
              >
                {isDone ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              <div className="flex min-h-8 flex-col justify-center">
                <span
                  className={cn(
                    "text-[15px] leading-tight",
                    isCurrent && "font-semibold text-tg-text",
                    isDone && "text-tg-text",
                    !isDone && !isCurrent && "text-tg-muted",
                  )}
                >
                  {step.label}
                </span>
                {isCurrent && <span className="mt-0.5 text-[12px] font-medium text-tg-accent">Поточний етап</span>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function PersonalData() {
  return (
    <div className="overflow-hidden rounded-[18px] bg-tg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-tg-blue-bg text-tg-accent">
          <User className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] text-tg-muted">Повне ім&apos;я</p>
          <p className="truncate text-[15px] font-medium text-tg-text">{caseInfo.clientName}</p>
        </div>
      </div>
      <div className="mx-4 h-px bg-tg-border" />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-tg-blue-bg text-tg-accent">
          <Phone className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] text-tg-muted">Номер телефону</p>
          <p className="text-[15px] font-medium text-tg-text">{caseInfo.phone}</p>
        </div>
      </div>
    </div>
  )
}

function Payments() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
          <p className="text-[12px] text-tg-muted">Оплачено</p>
          <p className="mt-1 text-[19px] font-semibold text-tg-green">{payments.paid}</p>
        </div>
        <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
          <p className="text-[12px] text-tg-muted">Залишок до оплати</p>
          <p className="mt-1 text-[19px] font-semibold text-tg-text">{payments.remaining}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-[18px] bg-tg-card shadow-sm">
        {payments.invoices.map((inv, i) => {
          const paid = inv.status === "Оплачено"
          return (
            <div key={inv.title}>
              {i > 0 && <div className="mx-4 h-px bg-tg-border" />}
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-tg-text">{inv.title}</p>
                  <p className="mt-0.5 text-[12px] text-tg-muted">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-semibold text-tg-text">{inv.amount}</p>
                  <p className={cn("mt-0.5 text-[12px] font-medium", paid ? "text-tg-green" : "text-tg-orange")}>
                    {inv.status}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CabinetScreen() {
  return (
    <div className="space-y-6 px-4 py-4">
      <HeroCard />
      <section>
        <SectionTitle>Етапи справи</SectionTitle>
        <Stepper />
      </section>
      <section>
        <SectionTitle>Особисті дані</SectionTitle>
        <PersonalData />
      </section>
      <section>
        <SectionTitle>Оплати</SectionTitle>
        <Payments />
      </section>
    </div>
  )
}
