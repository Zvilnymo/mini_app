"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import confetti from "canvas-confetti"
import { Trophy, Gift, Sparkles, X, Headphones } from "lucide-react"
import { director } from "@/lib/app-data"

export function CelebrationOverlay({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fire confetti bursts from the top corners a couple of times
  useEffect(() => {
    const fire = (originX: number, angle: number) => {
      confetti({
        particleCount: 70,
        spread: 65,
        startVelocity: 45,
        angle,
        origin: { x: originX, y: 0 },
        colors: ["#2aabee", "#2fb457", "#f5a63c", "#ffffff", "#1c8fd0"],
        zIndex: 9999,
        scalar: 0.9,
      })
    }
    fire(0.15, 60)
    fire(0.85, 120)
    const t1 = setTimeout(() => {
      fire(0.3, 70)
      fire(0.7, 110)
    }, 550)
    return () => clearTimeout(t1)
  }, [])

  // Reveal content in smooth stages
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100), // hero
      setTimeout(() => setStage(2), 700), // progress bar fills
      setTimeout(() => setStage(3), 1500), // director card slides in
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-tg-bg">
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-tg-card/80 text-tg-muted backdrop-blur transition-colors active:bg-tg-card"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-8">
        {/* Hero */}
        <div
          className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
            stage >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="relative flex size-20 items-center justify-center rounded-full bg-tg-green-bg">
            <Trophy className="size-10 text-tg-green" aria-hidden="true" />
            <Sparkles className="absolute -right-1 -top-1 size-6 text-tg-orange" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-pretty text-[26px] font-bold leading-tight text-tg-text">
            Усі документи зібрано!
          </h2>
          <p className="mt-2 text-pretty text-[15px] leading-relaxed text-tg-muted">
            Вітаємо, ви стали на крок ближче до <span className="font-semibold text-tg-green">фінансової свободи</span>
          </p>
        </div>

        {/* 100% progress bar */}
        <div className="mt-6 rounded-[20px] bg-tg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-tg-text">Готовність документів</span>
            <span className="text-[18px] font-bold text-tg-green">100%</span>
          </div>
          <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-tg-bg">
            <div
              className="h-full rounded-full bg-tg-green transition-[width] duration-[1100ms] ease-out"
              style={{ width: stage >= 2 ? "100%" : "62%" }}
            />
          </div>
          <p className="mt-2 text-[13px] text-tg-muted">7 з 7 документів прийнято</p>
        </div>

        {/* Director's congratulation */}
        <div
          className={`mt-5 overflow-hidden rounded-[24px] bg-tg-card shadow-sm transition-all duration-700 ease-out ${
            stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Photo header with soft accent backdrop */}
          <div className="relative flex justify-center bg-tg-blue-bg pt-4">
            <Image
              src={director.photo || "/placeholder.svg"}
              alt={`${director.name}, ${director.role}`}
              width={280}
              height={300}
              className="h-auto w-[220px] object-contain"
              priority
            />
          </div>

          <div className="px-5 pb-5 pt-4">
            <div className="text-center">
              <p className="text-[17px] font-bold text-tg-text">{director.name}</p>
              <p className="text-[13px] text-tg-accent">{director.role}</p>
            </div>

            <div className="mt-4 space-y-3">
              {director.paragraphs.map((p, i) => (
                <p key={i} className="text-pretty text-[14px] leading-relaxed text-tg-text">
                  {p}
                </p>
              ))}
            </div>

            <p className="mt-4 border-t border-tg-border pt-3 text-right text-[14px] font-semibold italic text-tg-muted">
              — {director.name}
            </p>
          </div>
        </div>

        {/* Bonus + support CTA */}
        <div
          className={`mt-5 rounded-[24px] bg-tg-green-bg p-5 transition-all delay-200 duration-700 ease-out ${
            stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tg-green text-white">
              <Gift className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-tg-text">Ваш бонус чекає!</p>
              <p className="mt-1 text-pretty text-[13px] leading-relaxed text-tg-text/80">{director.bonusNote}</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-tg-green py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
          >
            <Headphones className="size-5" aria-hidden="true" />
            Звернутися до підтримки
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-5 block px-4 py-2 text-[14px] font-medium text-tg-muted transition-opacity active:opacity-60"
        >
          Повернутися до документів
        </button>
      </div>
    </div>
  )
}
