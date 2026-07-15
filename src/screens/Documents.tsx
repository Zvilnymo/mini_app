import { useEffect, useState } from 'react';
import { Check, CircleCheckBig, ClipboardList, Paperclip, PlayCircle } from 'lucide-react';
import { api } from '../api/client';
import { useDocuments } from '../api/hooks';
import { compressImageIfNeeded, isTooLargeToUpload } from '../lib/compressImage';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useToast } from '../components/Toast';
import { Declaration } from './Declaration';
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

function DeclarationCard({ completed, onOpen }: { completed: boolean | null; onOpen: () => void }) {
  const cardModifier = completed ? ' doc-card--done' : '';
  return (
    <button
      type="button"
      className={`doc-card${cardModifier}`}
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
      onClick={onOpen}
    >
      <div className="doc-card-top">
        <span className="doc-icon" style={completed ? STATUS_TINT.accepted : { background: 'var(--tg-bg)', color: 'var(--tg-muted)' }}>
          <ClipboardList size={20} aria-hidden="true" />
          {completed && (
            <span className="doc-icon-check">
              <Check size={13} strokeWidth={3.5} aria-hidden="true" />
            </span>
          )}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="doc-title">Анкета декларацій</p>
          <p className="row-label">{completed ? 'Заповнено — натисніть, щоб змінити' : 'Заповніть анкету для декларації'}</p>
        </div>
      </div>
    </button>
  );
}

function TextDocCard({ item, onSaved }: { item: DocumentChecklistItem; onSaved: () => void }) {
  const isEmail = item.type === 'emailpass';
  const isDone = item.uploaded_count > 0;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Once already saved, hide the inputs and show only "Оновити" — re-saving
  // must overwrite the same Bitrix Disk file/row, not create a duplicate,
  // so the fields only reappear when the client explicitly asks to change them.
  const [editing, setEditing] = useState(!isDone);
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
      setEditing(false);
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
            {editing ? (
              <>
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
                  {saving ? 'Зберігаємо…' : 'Зберегти'}
                </button>
                {error && <p className="form-error">{error}</p>}
              </>
            ) : (
              <button type="button" className="btn-outline" onClick={() => setEditing(true)}>
                Оновити
              </button>
            )}
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
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const tint = item.latest_status ? STATUS_TINT[item.latest_status] : { background: 'var(--tg-bg)', color: 'var(--tg-muted)' };
  // A file made it in and wasn't rejected — show it as "done" regardless of
  // whether the AI gave a precise accepted/pending/uncertain verdict, so a
  // successful upload always reads as clearly finished at a glance.
  const isDone = item.uploaded_count > 0 && item.latest_status !== 'rejected';
  const isRejected = item.latest_status === 'rejected';
  const cardModifier = isDone ? ' doc-card--done' : isRejected ? ' doc-card--rejected' : '';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    let anyRejected = false;
    let failure: string | null = null;
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(files.length > 1 ? { done: i, total: files.length } : null);
      try {
        const compressed = await compressImageIfNeeded(files[i]);
        if (isTooLargeToUpload(compressed)) {
          failure = `Файл "${files[i].name}" завеликий навіть після стиснення. Спробуйте зменшити його або зробити менш детальний скріншот/фото.`;
          continue;
        }
        const result = await api.uploadDocument(item.type, compressed);
        if (result.validation_status === 'rejected') anyRejected = true;
      } catch (err) {
        failure = err instanceof Error ? err.message : 'Помилка завантаження';
      }
    }
    setUploadProgress(null);
    if (anyRejected) showError(REJECTION_MESSAGE);
    if (failure) setUploadError(failure);
    onUploaded();
    setUploading(false);
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
            <>
              <label className="doc-upload-btn">
                {uploading ? (
                  uploadProgress ? `Завантаження ${uploadProgress.done + 1} з ${uploadProgress.total}…` : 'Завантаження…'
                ) : (
                  <>
                    <Paperclip size={16} aria-hidden="true" />
                    {item.uploaded_count === 0 ? 'Завантажити' : 'Додати ще один документ'}
                  </>
                )}
                <input
                  type="file"
                  multiple={item.multiple}
                  style={{ display: 'none' }}
                  onChange={handleFile}
                  disabled={uploading}
                />
              </label>
              {!uploading && (item.uploaded_count > 0 || item.multiple) && (
                <p className="doc-hint">
                  {item.uploaded_count > 0 && `Завантажено: ${item.uploaded_count}. `}
                  {item.multiple && 'Можна обрати кілька файлів одразу'}
                </p>
              )}
            </>
          )}
          {item.video_url && (
            <a href={item.video_url} target="_blank" rel="noreferrer" className="doc-video-link">
              <PlayCircle size={14} aria-hidden="true" />
              Відео-інструкція: де взяти цей документ
            </a>
          )}
          {uploadError && <p className="form-error">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}

const CELEBRATION_SHOWN_KEY = 'zv_celebration_shown';

export function Documents() {
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [declarationCompleted, setDeclarationCompleted] = useState<boolean | null>(null);
  const { data, loading, error, refetch } = useDocuments();

  useEffect(() => {
    let cancelled = false;
    api
      .getDeclaration()
      .then((res) => {
        if (!cancelled) setDeclarationCompleted(res.completed);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // The declaration questionnaire counts as one more required item — it's
  // required, just not a file upload, so it isn't in `data` itself.
  const allReady =
    !!data && data.length > 0 && declarationCompleted === true &&
    data.every((d) => d.latest_status === 'accepted' || d.latest_status === 'pending');

  useEffect(() => {
    if (allReady && localStorage.getItem(CELEBRATION_SHOWN_KEY) !== 'true') {
      localStorage.setItem(CELEBRATION_SHOWN_KEY, 'true');
      setShowCelebration(true);
    }
  }, [allReady]);

  if (declarationOpen) {
    return <Declaration onBack={() => setDeclarationOpen(false)} />;
  }

  if (showCelebration) {
    return <CelebrationOverlay onClose={() => setShowCelebration(false)} />;
  }

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
  const totalCount = data.length + 1; // +1 for the declaration questionnaire
  const processed = data.filter((d) => d.latest_status === 'accepted' || d.latest_status === 'pending').length + (declarationCompleted ? 1 : 0);
  const percent = totalCount ? Math.round((processed / totalCount) * 100) : 0;

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
              {processed} з {totalCount} опрацьовано
            </p>
          </div>
          <span className="success-bar-percent">{percent}%</span>
        </div>
        <div className="success-bar-track">
          <div className="success-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {allReady && (
        <button type="button" className="complaint-trigger" onClick={() => setShowCelebration(true)}>
          <span className="row-icon" style={{ background: 'var(--tg-green-bg)', color: 'var(--tg-green)' }}>
            🎉
          </span>
          <div>
            <p className="row-value">Усі документи зібрано!</p>
            <p className="row-label">Переглянути привітання</p>
          </div>
        </button>
      )}

      <section>
        <h2 className="section-title">Обов'язкові документи</h2>
        <div className="doc-group">
          <DeclarationCard completed={declarationCompleted} onOpen={() => setDeclarationOpen(true)} />
          {required.map(renderCard)}
        </div>
      </section>

      <section>
        <h2 className="section-title">Додаткові документи</h2>
        <div className="doc-group">{optional.map(renderCard)}</div>
      </section>
    </div>
  );
}
