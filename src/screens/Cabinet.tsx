import { useState } from 'react';
import { AlertTriangle, Check, Phone, User } from 'lucide-react';
import { api } from '../api/client';
import { useMe } from '../api/hooks';

function formatUah(amount: number): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(amount) + ' грн';
}

function ComplaintBox() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="complaint-form">
        <p className="form-success">Дякуємо! Скаргу зареєстровано, менеджер зв'яжеться з вами найближчим часом.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="complaint-trigger" onClick={() => setOpen(true)}>
        <span className="row-icon" style={{ background: 'var(--tg-red-bg)', color: 'var(--tg-red)' }}>
          <AlertTriangle size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="row-value">Залишити скаргу</p>
          <p className="row-label">Створить задачу для вашого менеджера</p>
        </div>
      </button>
    );
  }

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitComplaint(text.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося надіслати скаргу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="complaint-form">
      <textarea
        className="complaint-textarea"
        placeholder="Опишіть проблему детальніше..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="form-error">{error}</p>}
      <button type="button" className="btn-accent btn-accent--block" disabled={submitting} onClick={submit}>
        {submitting ? 'Надсилаємо…' : 'Надіслати скаргу'}
      </button>
    </div>
  );
}

export function Cabinet() {
  // AppGate already guarantees registered + screening_completed before this
  // ever renders — this hook call reuses the same shared cache (see
  // api/hooks.ts), so no extra fetch happens here.
  const { data, loading, error, refetch } = useMe();

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

  const { client, case: caseStatus, payments } = data;
  const progress = caseStatus ? Math.round(((caseStatus.step - 1) / (caseStatus.steps.length - 1)) * 100) : 0;

  return (
    <div className="screen">
      <div className="hero-card">
        <p className="hero-eyebrow">Справа клієнта</p>
        <p className="hero-title">{client.full_name}</p>
        <div className="hero-status-pill">
          <span className="hero-status-dot" />
          {caseStatus?.step_label ?? 'Дані по справі поки не знайдено'}
        </div>
        {caseStatus && (
          <div className="hero-progress-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Прогрес справи</span>
              <span>{progress}%</span>
            </div>
            <div className="hero-progress-track">
              <div className="hero-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {caseStatus && (
        <section>
          <h2 className="section-title">Етапи справи</h2>
          <div className="card">
            <ol className="stepper-list">
              {caseStatus.steps.map((label, i) => {
                const stepNumber = i + 1;
                const isLast = stepNumber === caseStatus.steps.length;
                const isDone = stepNumber < caseStatus.step;
                const isCurrent = stepNumber === caseStatus.step;
                return (
                  <li key={label} className="stepper-row">
                    {!isLast && <span className={`stepper-line${isDone ? ' stepper-line--done' : ''}`} />}
                    <span
                      className={`stepper-dot${isDone ? ' stepper-dot--done' : ''}${isCurrent ? ' stepper-dot--current' : ''}`}
                    >
                      {isDone ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : stepNumber}
                    </span>
                    <div className="stepper-label-col">
                      <span className={`stepper-label${isDone || isCurrent ? ' stepper-label--active' : ''}`}>{label}</span>
                      {isCurrent && <span className="stepper-hint">Поточний етап</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Особисті дані</h2>
        <div className="card-list">
          <div className="card-list-row">
            <span className="row-icon">
              <User size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="row-label">Повне ім'я</p>
              <p className="row-value">{client.full_name}</p>
            </div>
          </div>
          <div className="card-list-divider" />
          <div className="card-list-row">
            <span className="row-icon">
              <Phone size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="row-label">Номер телефону</p>
              <p className="row-value">{client.phone}</p>
            </div>
          </div>
        </div>
      </section>

      {payments && (
        <section>
          <h2 className="section-title">Оплати</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="stat-grid">
              <div className="stat-tile">
                <p className="row-label">Оплачено</p>
                <p className="stat-value" style={{ color: 'var(--tg-green)' }}>{formatUah(payments.paid_total)}</p>
              </div>
              <div className="stat-tile">
                <p className="row-label">Залишок до оплати</p>
                <p className="stat-value">{formatUah(payments.unpaid_total)}</p>
              </div>
            </div>
            {payments.invoices.length > 0 && (
              <div className="card-list">
                {payments.invoices.map((invoice, i) => {
                  const paid = invoice.stage_id === 'DT31_1:P' || invoice.stage_id === 'DT31_1:UC_WW75SB';
                  return (
                    <div key={invoice.id}>
                      {i > 0 && <div className="card-list-divider" />}
                      <div className="card-list-row" style={{ justifyContent: 'space-between' }}>
                        <div>
                          <p className="row-value">{invoice.title ?? 'Рахунок'}</p>
                          <p className="row-label">
                            {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('uk-UA') : ''}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className="row-value">{invoice.amount ? formatUah(Number(invoice.amount)) : '—'}</p>
                          <p className="row-label" style={{ color: paid ? 'var(--tg-green)' : 'var(--tg-orange)' }}>
                            {invoice.stage_name ?? invoice.stage_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Підтримка</h2>
        <ComplaintBox />
      </section>
    </div>
  );
}
