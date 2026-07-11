import { Video, Phone, MapPin, Plus, CalendarPlus, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/status-pill"
import { conferences, type Conference, type ConfStatus, type ConfFormat } from "@/lib/app-data"

const statusTone: Record<ConfStatus, "green" | "red" | "orange" | "blue"> = {
  Заплановано: "blue",
  Завершено: "green",
  Скасовано: "red",
}

const formatMeta: Record<ConfFormat, { icon: typeof Video; label: string }> = {
  video: { icon: Video, label: "Відеозустріч" },
  phone: { icon: Phone, label: "Телефонна розмова" },
  office: { icon: MapPin, label: "Зустріч в офісі" },
}

function ConferenceCard({ conf }: { conf: Conference }) {
  const { icon: Icon, label } = formatMeta[conf.format]
  const upcoming = conf.status === "Заплановано"

  return (
    <div className="rounded-[18px] bg-tg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            upcoming ? "bg-tg-blue-bg text-tg-accent" : "bg-tg-bg text-tg-muted",
          )}
        >
          <Icon className="size-[22px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-tg-text">
                {conf.date}, {conf.time}
              </p>
              <p className="mt-0.5 text-[13px] text-tg-muted">{label}</p>
            </div>
            <StatusPill label={conf.status} tone={statusTone[conf.status]} />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[14px] text-tg-text">
            <span className="text-tg-muted">Юрист:</span>
            <span className="font-medium">{conf.person}</span>
          </div>
          <p className="text-[12px] text-tg-muted">{conf.role}</p>
        </div>
      </div>
      {upcoming && (
        <button
          type="button"
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-tg-accent py-2.5 text-[15px] font-semibold text-white shadow-sm shadow-tg-accent/30 transition-transform active:scale-[0.98]"
        >
          <Video className="size-[18px]" aria-hidden="true" />
          Приєднатися
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-tg-blue-bg text-tg-accent">
        <CalendarClock className="size-10" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="mt-5 text-[16px] font-medium text-tg-text text-balance">
        У вас поки немає запланованих консультацій
      </p>
      <p className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-tg-muted text-pretty">
        Запишіться на зустріч із юристом, щоб обговорити вашу справу
      </p>
      <button
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-tg-accent px-5 py-3 text-[15px] font-semibold text-white shadow-sm shadow-tg-accent/30 transition-transform active:scale-[0.98]"
      >
        <CalendarPlus className="size-[18px]" aria-hidden="true" />
        Записатися на консультацію
      </button>
    </div>
  )
}

export function ConferencesScreen({ empty = false }: { empty?: boolean }) {
  const upcoming = conferences.filter((c) => c.status === "Заплановано")
  const past = conferences.filter((c) => c.status !== "Заплановано")

  return (
    <div className="relative min-h-full">
      {empty ? (
        <EmptyState />
      ) : (
        <div className="space-y-6 px-4 py-4 pb-24">
          <section>
            <h2 className="px-1 pb-2 text-[13px] font-semibold uppercase tracking-wide text-tg-muted">Найближчі</h2>
            <div className="space-y-2.5">
              {upcoming.map((c, i) => (
                <ConferenceCard key={i} conf={c} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="px-1 pb-2 text-[13px] font-semibold uppercase tracking-wide text-tg-muted">Минулі</h2>
            <div className="space-y-2.5">
              {past.map((c, i) => (
                <ConferenceCard key={i} conf={c} />
              ))}
            </div>
          </section>
        </div>
      )}

      <button
        type="button"
        aria-label="Записатися на нову консультацію"
        className="absolute bottom-5 right-5 flex size-14 items-center justify-center rounded-full bg-tg-accent text-white shadow-lg shadow-tg-accent/40 transition-transform active:scale-95"
      >
        <Plus className="size-7" strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  )
}
