// Mock data for the Telegram Mini App — legal services (personal bankruptcy / debt relief)

import type { LucideIcon } from "lucide-react"
import { IdCard, House, ScrollText, Landmark, Car, Wallet, Users } from "lucide-react"

export type StepState = "done" | "current" | "upcoming"

export interface CaseStep {
  label: string
  state: StepState
}

export const caseInfo = {
  clientName: "Коваленко Андрій Миколайович",
  caseNumber: "Справа № БР-2024/0847",
  statusLabel: "Початок робіт",
  phone: "+380 (67) 214-88-30",
}

export const caseSteps: CaseStep[] = [
  { label: "Перша консультація", state: "done" },
  { label: "Надання даних", state: "done" },
  { label: "Погодження договору", state: "done" },
  { label: "Оплата авансу", state: "done" },
  { label: "Початок робіт", state: "current" },
  { label: "Передсудовий період", state: "upcoming" },
  { label: "Судовий період", state: "upcoming" },
  { label: "Післясудовий період", state: "upcoming" },
]

export const payments = {
  paid: "15 000 грн",
  remaining: "10 000 грн",
  total: 25000,
  paidAmount: 15000,
  invoices: [
    { title: "Аванс за договором", amount: "10 000 грн", date: "18 черв. 2024", status: "Оплачено" },
    { title: "Перша консультація", amount: "5 000 грн", date: "05 черв. 2024", status: "Оплачено" },
    { title: "Судовий збір", amount: "10 000 грн", date: "до 25 лип. 2024", status: "Очікує" },
  ],
}

export type DocStatus = "Прийнято" | "Відхилено" | "На перевірці" | "Завантажено" | "Не завантажено"

export interface DocItem {
  icon: LucideIcon
  title: string
  status: DocStatus
}

export const requiredDocs: DocItem[] = [
  { icon: IdCard, title: "Сканкопія паспорта та РНОКПП (ІПН)", status: "Прийнято" },
  { icon: House, title: "Витяг з реєстру територіальної громади про місце проживання", status: "На перевірці" },
  { icon: ScrollText, title: "Кредитні договори з усіма банками та МФО", status: "Завантажено" },
  { icon: Landmark, title: "Виписки про залишок коштів на банківських рахунках", status: "Відхилено" },
]

export const additionalDocs: DocItem[] = [
  { icon: Car, title: "Документи на рухоме та нерухоме майно", status: "Не завантажено" },
  { icon: Wallet, title: "Довідка про доходи за останні 12 місяців", status: "Завантажено" },
  { icon: Users, title: "Свідоцтва про шлюб та народження дітей", status: "Не завантажено" },
]

export type ConfStatus = "Заплановано" | "Завершено" | "Скасовано"
export type ConfFormat = "video" | "phone" | "office"

export interface Conference {
  date: string
  time: string
  format: ConfFormat
  person: string
  role: string
  status: ConfStatus
}

export const conferences: Conference[] = [
  {
    date: "12 липня",
    time: "14:30",
    format: "video",
    person: "Олена Гриценко",
    role: "Провідний юрист",
    status: "Заплановано",
  },
  {
    date: "19 липня",
    time: "11:00",
    format: "phone",
    person: "Дмитро Савчук",
    role: "Менеджер справи",
    status: "Заплановано",
  },
  {
    date: "28 червня",
    time: "16:00",
    format: "office",
    person: "Олена Гриценко",
    role: "Провідний юрист",
    status: "Завершено",
  },
  {
    date: "14 червня",
    time: "10:30",
    format: "video",
    person: "Дмитро Савчук",
    role: "Менеджер справи",
    status: "Скасовано",
  },
]

// ── Chat with the case manager ──────────────────────────────────────────────
export interface ChatMessage {
  id: number
  from: "manager" | "client"
  text: string
  time: string
}

export const manager = {
  name: "Дмитро Савчук",
  role: "Менеджер справи",
  online: true,
}

export const chatMessages: ChatMessage[] = [
  {
    id: 1,
    from: "manager",
    text: "Вітаю, Андрію! Мене звати Дмитро, я супроводжую вашу справу про списання боргів. Готовий відповісти на будь-які запитання.",
    time: "09:12",
  },
  {
    id: 2,
    from: "client",
    text: "Доброго дня! Дякую. Коли приблизно буде подано заяву до суду?",
    time: "09:20",
  },
  {
    id: 3,
    from: "manager",
    text: "Щойно ми отримаємо виписки з банків — залишилось буквально два документи. Після цього подаємо протягом 3–5 робочих днів.",
    time: "09:23",
  },
  {
    id: 4,
    from: "manager",
    text: "До речі, ви чудово просуваєтесь — вже 62% шляху позаду. Завантажте виписки у вкладці «Документи», і ми одразу рушимо далі 💪",
    time: "09:24",
  },
  {
    id: 5,
    from: "client",
    text: "Зрозумів, завантажу сьогодні ввечері.",
    time: "09:31",
  },
]

// ── Home dashboard ──────────────────────────────────────────────────────────
export const homeStats = {
  progress: 62,
  daysActive: 34,
  docsReady: 3,
  docsTotal: 7,
  nextStep: "Завантажте банківські виписки",
  nextStepHint: "Це останній крок перед поданням заяви до суду",
  motivation: "Ви на фінішній прямій — залишилось зовсім трохи!",
}

export const debtOverview = {
  totalDebt: "480 000 грн",
  toBeWrittenOff: "480 000 грн",
  creditors: 4,
}

// ── Director's congratulation (shown when all documents are accepted) ────────
export const director = {
  name: "Олег Болотський",
  role: 'Керівник ЮК "Звільнимо"',
  photo: "/images/director.png",
  paragraphs: [
    "Андрію, вітаю вас особисто! Ви зробили найважливіше — зібрали та подали всі документи. Це серйозний крок, і ви впорались на відмінно.",
    "Дякую за вашу довіру та відповідальність. Тепер естафета переходить до нашої команди — і повірте, ми вас не підведемо.",
    "Попереду підготовка й подання заяви до суду. Ви стали на крок ближче до фінансової свободи, а решту роботи ми беремо на себе.",
  ],
  bonusNote: "Ви отримали персональний бонус за завершення етапу. Зверніться до підтримки, щоб забрати його.",
}
