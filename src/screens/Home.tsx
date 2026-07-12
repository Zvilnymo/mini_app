import { ArrowRight, CalendarClock, FileCheck2, Flame, MessageCircle, Sparkles, TrendingDown, Wallet } from 'lucide-react';
import type { TabKey } from '../components/TabBar';
import { useDocuments, useMe } from '../api/hooks';

function ProgressRing({ percent }: { percent: number }) {
  const size = 100;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ffffff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{percent}%</span>
        <span style={{ marginTop: 4, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>пройдено</span>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  value,
  label,
  hint,
  tint,
  trend,
}: {
  icon: typeof Wallet;
  value: string;
  label: string;
  hint?: string;
  tint: string;
  trend?: boolean;
}) {
  return (
    <div className="stat-tile">
      <span className={`stat-icon ${tint}`} style={{ position: 'relative' }}>
        <Icon size={18} aria-hidden="true" />
        {trend && (
          <span className="stat-icon-trend">
            <TrendingDown size={11} strokeWidth={3} aria-hidden="true" />
          </span>
        )}
      </span>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}

function formatUah(amount: number): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(amount) + ' грн';
}

export function Home({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const { data, loading, error, refetch } = useMe();
  const { data: docs } = useDocuments();

  if (loading) {
    return (
      <div className="screen-center">
        <span>Завантаження…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="placeholder-block">
        <p className="placeholder-title">Не вдалося завантажити дані</p>
        <p className="placeholder-description">{error}</p>
        <button type="button" className="btn-outline" style={{ marginTop: 16 }} onClick={refetch}>
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (!data || !data.registered) return null;

  const { client, case: caseStatus, debt_overview, lead_debt, payments, days_active, docs_ready, docs_total } = data;
  const firstName = client.full_name.split(' ')[1] ?? client.full_name.split(' ')[0];

  // Blends every source of progress we currently have — case stage in CRM
  // and document collection — into one number, instead of the stage alone.
  // Once "Зустрічі" has real data, add a third term here the same way.
  const stageProgress = caseStatus ? (caseStatus.step - 1) / (caseStatus.steps.length - 1) : 0;
  const docProgress = docs_total > 0 ? docs_ready / docs_total : 0;
  const progress = Math.round(((stageProgress + docProgress) / 2) * 100);

  const nextDoc = docs?.find((d) => d.required && d.latest_status !== 'accepted' && d.latest_status !== 'pending');
  // Once every required document is in, the next actionable thing isn't
  // "upload something" anymore — fall back to whatever the CRM says the
  // case is currently doing, so this card doesn't go stale/generic once
  // document collection is done but the case itself is still moving.
  const nextStepTitle = nextDoc
    ? `Завантажте: ${nextDoc.name}`
    : caseStatus?.current_stage_name
      ? `Поточний статус: ${caseStatus.current_stage_name}`
      : 'Всі документи опрацьовуються';
  const nextStepHint = nextDoc
    ? 'Це наближає вас до наступного етапу справи'
    : 'Нічого від вас не потрібно — ми тримаємо вас в курсі прогресу';

  const debtValue = lead_debt ?? debt_overview?.to_be_written_off ?? debt_overview?.total_debt ?? null;

  return (
    <div className="screen">
      <div className="hero-card" style={{ display: 'flex', gap: 16 }}>
        <ProgressRing percent={progress} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="hero-eyebrow">Вітаємо, {firstName}!</p>
          <p className="hero-title" style={{ marginTop: 4 }}>
            {caseStatus?.step_label ?? 'Ваша справа скоро з\'явиться тут'}
          </p>
        </div>
      </div>
      {days_active !== null && (
        <div
          style={{
            marginTop: -10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 16,
            background: 'var(--tg-blue-bg)',
            padding: '10px 14px',
          }}
        >
          <Flame size={18} color="var(--tg-accent)" aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{days_active} днів у справі — тримаєте темп!</span>
        </div>
      )}

      <button type="button" className="next-step-card" onClick={() => onNavigate('documents')}>
        <span className="stat-icon tint-orange" style={{ width: 44, height: 44, borderRadius: 16 }}>
          <Sparkles size={22} aria-hidden="true" />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="next-step-eyebrow">Наступний крок</p>
          <p className="next-step-title">{nextStepTitle}</p>
          <p className="next-step-hint">{nextStepHint}</p>
        </div>
        <ArrowRight size={20} color="var(--tg-muted)" aria-hidden="true" />
      </button>

      <section>
        <h2 className="section-title">Ваш прогрес</h2>
        <div className="stat-grid">
          <StatTile
            icon={TrendingDown}
            value={debtValue != null ? formatUah(debtValue) : '—'}
            label="Сума боргу"
            hint="Незабаром суттєво зменшиться"
            tint="tint-green"
            trend
          />
          <StatTile
            icon={Wallet}
            value={payments ? formatUah(payments.unpaid_total) : '—'}
            label="Залишок до оплати"
            tint="tint-orange"
          />
          <StatTile icon={FileCheck2} value={`${docs_ready} з ${docs_total}`} label="Документів готово" tint="tint-blue" />
          <StatTile icon={CalendarClock} value="Скоро" label="Найближча зустріч" tint="tint-blue" />
        </div>
      </section>

      <div className="encourage-card">
        <p className="encourage-text">
          Кожен завантажений документ наближає вас до життя без боргів. Ми поруч на кожному етапі — не зупиняйтесь!
        </p>
        <button type="button" className="btn-accent" style={{ marginTop: 14 }} onClick={() => onNavigate('chat')}>
          <MessageCircle size={18} aria-hidden="true" />
          Написати менеджеру
        </button>
      </div>
    </div>
  );
}
