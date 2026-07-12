"use client"

import { Sparkles, ArrowRight, TrendingDown, Users, FileCheck2, CalendarClock, MessageCircle, Flame } from "lucide-react"
import { homeStats, debtOverview, caseInfo } from "@/lib/app-data"
import type { TabKey as NavKey } from "@/components/tab-bar"

// Circular progress ring drawn with SVG (no hand-rolled paths — just a stroked circle)
function ProgressRing({ percent }: { percent: number }) {
  const size = 132
  const stroke = 12
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percent / 100) * circumference
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/25" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-white transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-bold leading-none">{percent}%</span>
        <span className="mt-1 text-[12px] font-medium text-white/80">пройдено</span>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  value,
  label,
  tint,
}: {
  icon: typeof Users
  value: string
  label: string
  tint: string
}) {
  return (
    <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
      <span className={`flex size-9 items-center justify-center rounded-full ${tint}`}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <p className="mt-2.5 text-[19px] font-bold text-tg-text">{value}</p>
      <p className="text-[12px] leading-tight text-tg-muted">{label}</p>
    </div>
  )
}

export function HomeScreen({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  const firstName = caseInfo.clientName.split(" ")[1] ?? "клієнте"

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Greeting + motivation hero */}
      <div className="relative overflow-hidden rounded-[22px] p-5 text-white shadow-lg shadow-tg-accent/25">
        <div className="absolute inset-0 bg-gradient-to-br from-tg-accent to-tg-accent-strong" aria-hidden="true" />
        <div className="relative flex items-center gap-4">
          <ProgressRing percent={homeStats.progress} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white/80">Вітаємо, {firstName}!</p>
            <p className="mt-1 text-[17px] font-semibold leading-snug text-balance">{homeStats.motivation}</p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/15 px-3.5 py-2.5 backdrop-blur">
          <Flame className="size-5 shrink-0 text-white" aria-hidden="true" />
          <p className="text-[13px] font-medium leading-tight">
            {homeStats.daysActive} днів у справі — тримаєте темп!
          </p>
        </div>
      </div>

      {/* Next action call-to-action */}
      <button
        type="button"
        onClick={() => onNavigate("documents")}
        className="flex w-full items-center gap-3.5 rounded-[20px] bg-tg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-tg-orange-bg text-tg-orange">
          <Sparkles className="size-[22px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-tg-orange">Наступний крок</p>
          <p className="mt-0.5 text-[15px] font-semibold leading-tight text-tg-text text-pretty">
            {homeStats.nextStep}
          </p>
          <p className="mt-0.5 text-[12px] leading-tight text-tg-muted">{homeStats.nextStepHint}</p>
        </div>
        <ArrowRight className="size-5 shrink-0 text-tg-muted" aria-hidden="true" />
      </button>

      {/* Success stats grid */}
      <section>
        <h2 className="px-1 pb-2 text-[13px] font-semibold uppercase tracking-wide text-tg-muted">Ваш прогрес</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            icon={TrendingDown}
            value={debtOverview.toBeWrittenOff}
            label="Боргів до списання"
            tint="bg-tg-green-bg text-tg-green"
          />
          <StatTile
            icon={Users}
            value={`${debtOverview.creditors} кредитори`}
            label="У складі справи"
            tint="bg-tg-blue-bg text-tg-accent"
          />
          <StatTile
            icon={FileCheck2}
            value={`${homeStats.docsReady} з ${homeStats.docsTotal}`}
            label="Документів готово"
            tint="bg-tg-orange-bg text-tg-orange"
          />
          <StatTile
            icon={CalendarClock}
            value="12 лип."
            label="Найближча зустріч"
            tint="bg-tg-blue-bg text-tg-accent"
          />
        </div>
      </section>

      {/* Encouraging note + chat CTA */}
      <div className="rounded-[20px] bg-tg-card p-4 shadow-sm">
        <p className="text-[14px] leading-relaxed text-tg-text text-pretty">
          Кожен завантажений документ наближає вас до життя без боргів. Ми поруч на кожному етапі — не зупиняйтесь!
        </p>
        <button
          type="button"
          onClick={() => onNavigate("chat")}
          className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-tg-accent px-4 py-2.5 text-[14px] font-semibold text-white transition-transform active:scale-[0.97]"
        >
          <MessageCircle className="size-[18px]" aria-hidden="true" />
          Написати менеджеру
        </button>
      </div>
    </div>
  )
}
