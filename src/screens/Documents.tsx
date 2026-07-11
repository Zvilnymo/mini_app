import { useState } from 'react';
import { Check, CircleCheckBig, ClipboardList, Paperclip } from 'lucide-react';
import { api } from '../api/client';
import { useDocuments, useMe } from '../api/hooks';
import { useToast } from '../components/Toast';
import { Screening } from './Screening';
import type { DocumentChecklistItem } from '../api/types';

const STATUS_LABEL: Record<string, string> = {
  accepted: 'Прийнято',
  rejected: 'Відхилено',
  uncertain: 'На перевірці',
  pending: 'Завантажено',
};

const STATUS_TINT: Record<string, { background: string; color: string }> = {
  accepted: { background: 'var(--tg-green-bg)', color: 'var(--tg-green)' },
  rejected: { background: 'var(--tg-red-bg)', color: 'var(--tg-red)' },
  uncertain: { background: 'var(--tg-orange-bg)', color: 'var(--tg-orange)' },
  pending: { background: 'var(--tg-blue-bg)', color: 'var(--tg-accent)' },
};

const REJECTION_MESSAGE =
  'Виникла помилка — можливо, ви завантажили некоректний документ. Спробуйте інший файл або зверніться до менеджера.';

function StatusPill({ status }: { status: DocumentChecklistItem['latest_status'] }) {
  if (!status) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 500,
        ...STATUS_TINT[status],
      }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function AnketaCard() {
  const { data } = useMe();
  const [open, setOpen] = useState(false);
  const completed = data && data.registered ? data.screening_completed : false;

  if (open) {
    return (
      <div className="card">
        <Screening title="Анкета" onDone={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <button type="button" className="complaint-trigger" onClick={() => setOpen(true)}>
      <span className="row-icon" style={{ background: 'var(--tg-blue-bg)', color: 'var(--tg-accent)' }}>
        <ClipboardList size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="row-value">Анкета</p>
        <p className="row-label">{completed ? 'Заповнено — натисніть, щоб змінити' : 'Ще не заповнено'}</p>
      </div>
    </button>
  );
}

function TextDocCard({ item, onSaved }: { item: DocumentChecklistItem; onSaved: () => void }) {
  const isEmail = item.type === 'emailpass';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDone = item.uploaded_count > 0;
  const cardModifier = isDone ? ' doc-card--done' : '';

  const save = async () => {
    const text = isEmail ? `Email: ${email.trim()}\nПароль: ${password.trim()}` : password.trim();
    if (isEmail ? !email.trim() || !password.trim() : !password.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.uploadTextDocument(item.type, text);
      setPassword('');
      setEmail('');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`doc-card${cardModifier}`}>
      <div className="doc-card-top">
        <span className="doc-icon" style={isDone ? STATUS_TINT.accepted : { background: 'var(--tg-bg)', color: 'var(--tg-muted)' }}>
          <span style={{ fontSize: 20 }}>{item.emoji}</span>
          {isDone && (
            <span className="doc-icon-check">
              <Check size={13} strokeWidth={3.5} aria-hidden="true" />
            </span>
          )}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="doc-title-row">
            <p className="doc-title">{item.name}</p>
            {isDone && (
              <span
                style={{
                  display: 'inline-flex',
                  flexShrink: 0,
                  alignItems: 'center',
                  borderRadius: 999,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  ...STATUS_TINT.pending,
                }}
              >
                Збережено
              </span>
            )}
          </div>
          <div className="register-form" style={{ paddingTop: 8 }}>
            {isEmail && (
              <input
                className="text-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
              />
            )}
            <input
              className="text-input"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="btn-accent" disabled={saving} onClick={save}>
              {saving ? 'Зберігаємо…' : isDone ? 'Оновити' : 'Зберегти'}
            </button>
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCard({ item, onUploaded }: { item: DocumentChecklistItem; onUploaded: () => void }) {
  const { showError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const tint = item.latest_status ? STATUS_TINT[item.latest_status] : { background: 'var(--tg-bg)', color: 'var(--tg-muted)' };
  // A file made it in and wasn't rejected — show it as "done" regardless of
  // whether the AI gave a precise accepted/pending/uncertain verdict, so a
  // successful upload always reads as clearly finished at a glance.
  const isDone = item.uploaded_count > 0 && item.latest_status !== 'rejected';
  const isRejected = item.latest_status === 'rejected';
  const cardModifier = isDone ? ' doc-card--done' : isRejected ? ' doc-card--rejected' : '';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.uploadDocument(item.type, file);
      if (result.validation_status === 'rejected') {
        showError(REJECTION_MESSAGE);
      }
      onUploaded();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Помилка завантаження');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`doc-card${cardModifier}`}>
      <div className="doc-card-top">
        <span className="doc-icon" style={tint}>
          <span style={{ fontSize: 20 }}>{item.emoji}</span>
          {isDone && (
            <span className="doc-icon-check">
              <Check size={13} strokeWidth={3.5} aria-hidden="true" />
            </span>
          )}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="doc-title-row">
            <p className="doc-title">{item.name}</p>
            <StatusPill status={item.latest_status} />
          </div>
          {item.uploadable && (
            <label className="doc-upload-btn">
              {uploading ? (
                'Завантаження…'
              ) : (
                <>
                  <Paperclip size={16} aria-hidden="true" />
                  {item.uploaded_count > 0 ? 'Замінити файл' : 'Завантажити'}
                </>
              )}
              <input type="file" style={{ display: 'none' }} onChange={handleFile} disabled={uploading} />
            </label>
          )}
          {uploadError && <p className="form-error">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}

export function Documents() {
  const { data, loading, error, refetch } = useDocuments();

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
        <p className="placeholder-title">Не вдалося завантажити чек-лист</p>
        <p className="placeholder-description">{error}</p>
        <button type="button" className="btn-outline" style={{ marginTop: 16 }} onClick={refetch}>
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (!data) return null;

  const required = data.filter((d) => d.required);
  const optional = data.filter((d) => !d.required);
  const processed = data.filter((d) => d.latest_status === 'accepted' || d.latest_status === 'pending').length;
  const percent = data.length ? Math.round((processed / data.length) * 100) : 0;

  const renderCard = (item: DocumentChecklistItem) =>
    item.text_input ? (
      <TextDocCard key={item.type} item={item} onSaved={refetch} />
    ) : (
      <DocCard key={item.type} item={item} onUploaded={refetch} />
    );

  return (
    <div className="screen">
      <div className="success-bar">
        <div className="success-bar-top">
          <span className="row-icon" style={{ width: 44, height: 44, background: 'var(--tg-green-bg)', color: 'var(--tg-green)' }}>
            <CircleCheckBig size={24} aria-hidden="true" />
          </span>
          <div style={{ flex: 1 }}>
            <p className="success-bar-title">Готовність документів</p>
            <p className="success-bar-subtitle">
              {processed} з {data.length} опрацьовано
            </p>
          </div>
          <span className="success-bar-percent">{percent}%</span>
        </div>
        <div className="success-bar-track">
          <div className="success-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <AnketaCard />

      <section>
        <h2 className="section-title">Обов'язкові документи</h2>
        <div className="doc-group">{required.map(renderCard)}</div>
      </section>

      <section>
        <h2 className="section-title">Додаткові документи</h2>
        <div className="doc-group">{optional.map(renderCard)}</div>
      </section>
    </div>
  );
}
