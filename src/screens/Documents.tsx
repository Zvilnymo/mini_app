import { useState } from 'react';
import { Check, CircleCheckBig, Paperclip } from 'lucide-react';
import { api } from '../api/client';
import { useDocuments } from '../api/hooks';
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

function DocCard({ item, onUploaded }: { item: DocumentChecklistItem; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const tint = item.latest_status ? STATUS_TINT[item.latest_status] : { background: 'var(--tg-bg)', color: 'var(--tg-muted)' };
  const isAccepted = item.latest_status === 'accepted';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await api.uploadDocument(item.type, file);
      onUploaded();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Помилка завантаження');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="doc-card">
      <div className="doc-card-top">
        <span className="doc-icon" style={tint}>
          <span style={{ fontSize: 20 }}>{item.emoji}</span>
          {isAccepted && (
            <span className="doc-icon-check">
              <Check size={11} strokeWidth={3} aria-hidden="true" />
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

      <section>
        <h2 className="section-title">Обов'язкові документи</h2>
        <div className="doc-group">
          {required.map((item) => (
            <DocCard key={item.type} item={item} onUploaded={refetch} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Додаткові документи</h2>
        <div className="doc-group">
          {optional.map((item) => (
            <DocCard key={item.type} item={item} onUploaded={refetch} />
          ))}
        </div>
      </section>
    </div>
  );
}
