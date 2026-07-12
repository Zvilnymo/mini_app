import { useEffect, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Paperclip, Phone, User } from 'lucide-react';
import { api } from '../api/client';
import { useMe } from '../api/hooks';
import { compressImageIfNeeded, isTooLargeToUpload } from '../lib/compressImage';
import type { ComplaintDepartment } from '../api/types';

function formatUah(amount: number): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(amount) + ' грн';
}

function ReceiptUpload({ invoiceId, pending }: { invoiceId: number; pending: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [sent, setSent] = useState(pending);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return <p className="receipt-sent" style={{ color: 'var(--tg-orange)' }}>Квитанцію надіслано, очікує на перевірку</p>;
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageIfNeeded(file);
      if (isTooLargeToUpload(compressed)) {
        setError('Файл завеликий навіть після стиснення');
        return;
      }
      await api.uploadReceipt(invoiceId, compressed);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити квитанцію');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="doc-upload-btn">
        {uploading ? (
          'Завантаження…'
        ) : (
          <>
            <Paperclip size={14} aria-hidden="true" />
            Завантажити чек
          </>
        )}
        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function DepartmentPicker({
  departments,
  value,
  onChange,
}: {
  departments: ComplaintDepartment[];
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = departments.find((d) => d.key === value);

  return (
    <div className="dept-picker">
      <button type="button" className="text-input dept-picker-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{selected?.name ?? 'Оберіть відділ'}</span>
        <ChevronDown size={18} className={`dept-picker-chevron${open ? ' dept-picker-chevron--open' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="dept-picker-list">
          {departments.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`dept-picker-option${d.key === value ? ' dept-picker-option--active' : ''}`}
              onClick={() => {
                onChange(d.key);
                setOpen(false);
              }}
            >
              {d.name}
              {d.key === value && <Check size={16} strokeWidth={3} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ComplaintBox() {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<ComplaintDepartment[]>([]);
  const [department, setDepartment] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open || departments.length > 0) return;
    api
      .getComplaintDepartments()
      .then((res) => {
        setDepartments(res.departments);
        setDepartment(res.departments[0]?.key ?? '');
      })
      .catch(() => {});
  }, [open, departments.length]);

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
    if (!department || !employeeName.trim() || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitComplaint(department, employeeName.trim(), text.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося надіслати скаргу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="complaint-form">
      <DepartmentPicker departments={departments} value={department} onChange={setDepartment} />
      <input
        className="text-input"
        placeholder="ПІБ співробітника, на якого скарга"
        value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)}
      />
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
              <div className="doc-group">
                {payments.invoices.map((invoice) => {
                  const paid = invoice.stage_id === 'DT31_1:P' || invoice.stage_id === 'DT31_1:UC_WW75SB';
                  const pending = invoice.receipt_pending && !paid;
                  const cardModifier = paid ? ' doc-card--done' : pending ? ' doc-card--pending' : '';
                  const statusLabel = paid ? 'Зараховано' : pending ? 'На перевірці' : (invoice.stage_name ?? invoice.stage_id);
                  return (
                    <div key={invoice.id} className={`doc-card${cardModifier}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <p className="row-value">{invoice.title ?? 'Рахунок'}</p>
                          <p className="row-label">
                            {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('uk-UA') : ''}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className="row-value">{invoice.amount ? formatUah(Number(invoice.amount)) : '—'}</p>
                          <p className="row-label" style={{ color: paid ? 'var(--tg-green)' : 'var(--tg-orange)' }}>
                            {statusLabel}
                          </p>
                        </div>
                      </div>
                      {!paid && <ReceiptUpload invoiceId={invoice.id} pending={invoice.receipt_pending} />}
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
