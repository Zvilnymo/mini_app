import { cn } from "@/lib/utils"

type Tone = "green" | "red" | "orange" | "blue" | "muted"

const toneClasses: Record<Tone, string> = {
  green: "bg-tg-green-bg text-tg-green",
  red: "bg-tg-red-bg text-tg-red",
  orange: "bg-tg-orange-bg text-tg-orange",
  blue: "bg-tg-blue-bg text-tg-accent",
  muted: "bg-tg-bg text-tg-muted",
}

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  )
}
