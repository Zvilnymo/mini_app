import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Phone, Plus, Search, Users, X } from 'lucide-react';
import { api } from '../api/client';
import type {
  AdminClientDetail,
  AdminClientRow,
  AdminEvent,
  ClientConferenceFilter,
  ClientSearchResult,
  EventInvitee,
  EventType,
} from '../api/types';
import './AdminConferences.css';

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

// ---- Client picker (search + multi-select) ----

function ClientPicker({ selected, onChange }: { selected: ClientSearchResult[]; onChange: (clients: ClientSearchResult[]) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientSearchResult[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api.adminSearchClients(query.trim()).then((res) => setResults(res.clients)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const toggle = (client: ClientSearchResult) => {
    if (selected.some((c) => c.id === client.id)) {
      onChange(selected.filter((c) => c.id !== client.id));
    } else {
      onChange([...selected, client]);
    }
  };

  return (
    <div>
      <div className="admin-search-row">
        <Search size={16} aria-hidden="true" />
        <input
          className="admin-search-input"
          placeholder="Пошук за ім'ям або телефоном…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {selected.length > 0 && (
        <div className="admin-chip-row">
          {selected.map((c) => (
            <span key={c.id} className="admin-chip">
              {c.full_name}
              <button type="button" onClick={() => toggle(c)} aria-label="Прибрати">
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      {results.length > 0 && (
        <div className="card-list" style={{ marginTop: 8 }}>
          {results.map((c, i) => {
            const isSelected = selected.some((s) => s.id === c.id);
            return (
              <div key={c.id}>
                {i > 0 && <div className="card-list-divider" />}
                <button type="button" className="admin-client-row" onClick={() => toggle(c)}>
                  <div>
                    <p className="row-value">{c.full_name}</p>
                    <p className="row-label">{c.phone}</p>
                  </div>
                  {isSelected && <Check size={18} color="var(--tg-accent)" aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Create event ----

function CreateEventView({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [types, setTypes] = useState<EventType[]>([]);
  const [typeCode, setTypeCode] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [durationMin, setDurationMin] = useState(30);
  const [link, setLink] = useState('');
  const [clients, setClients] = useState<ClientSearchResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.adminListEventTypes().then((res) => setTypes(res.types.filter((t) => t.active))).catch(() => {});
  }, []);

  const selectType = (t: EventType) => {
    setTypeCode(t.type_code);
    setTitle(t.title);
    setDescription(t.description ?? '');
  };

  const submit = async () => {
    if (!title.trim() || !startAt) {
      setError("Вкажіть назву та дату/час");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.adminCreateEvent({
        type_code: typeCode,
        title: title.trim(),
        description: description.trim() || undefined,
        start_at: new Date(startAt).toISOString(),
        duration_min: durationMin,
        format: 'video',
        link: link.trim() || undefined,
        client_ids: clients.map((c) => c.id),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося створити зустріч');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onCancel} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <p className="declaration-title">Нова зустріч</p>
      </div>

      {types.length > 0 && (
        <section>
          <h2 className="section-title">Тип консультації</h2>
          <div className="admin-type-grid">
            {types.map((t) => (
              <button
                key={t.type_code}
                type="button"
                className={`admin-type-btn${typeCode === t.type_code ? ' admin-type-btn--active' : ''}`}
                onClick={() => selectType(t)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="register-form">
        <input className="text-input" placeholder="Назва" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="complaint-textarea" placeholder="Опис" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input
          className="text-input"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />
        <input
          className="text-input"
          type="number"
          placeholder="Тривалість (хв)"
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value) || 30)}
        />
        <input className="text-input" placeholder="Посилання на зустріч" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>

      <section>
        <h2 className="section-title">Запросити клієнтів</h2>
        <ClientPicker selected={clients} onChange={setClients} />
      </section>

      {error && <p className="form-error">{error}</p>}
      <button type="button" className="btn-accent btn-accent--block" disabled={submitting} onClick={submit}>
        {submitting ? 'Створюємо…' : 'Створити та запросити'}
      </button>
    </div>
  );
}

// ---- Event detail ----

const EDITABLE_FIELDS: { key: keyof AdminEvent; label: string; kind: 'text' | 'textarea' | 'datetime' | 'number' }[] = [
  { key: 'title', label: 'Назва', kind: 'text' },
  { key: 'description', label: 'Опис', kind: 'textarea' },
  { key: 'start_at', label: 'Дата/час', kind: 'datetime' },
  { key: 'duration_min', label: 'Тривалість (хв)', kind: 'number' },
  { key: 'link', label: 'Посилання', kind: 'text' },
];

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditEventForm({ event, onDone, onCancel }: { event: AdminEvent; onDone: () => void; onCancel: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => ({
    title: event.title,
    description: event.description ?? '',
    start_at: toDatetimeLocal(event.start_at),
    duration_min: String(event.duration_min),
    link: event.link ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const f of EDITABLE_FIELDS) {
        const current = f.key === 'start_at' ? toDatetimeLocal(event.start_at) : String(event[f.key] ?? '');
        const next = values[f.key];
        if (next === current) continue;
        const value = f.key === 'start_at' ? new Date(next).toISOString() : next;
        await api.adminUpdateEvent(event.event_id, f.key, value);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти зміни');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="complaint-form">
      {EDITABLE_FIELDS.map((f) => (
        <div key={f.key}>
          {f.kind === 'textarea' ? (
            <textarea
              className="complaint-textarea"
              placeholder={f.label}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          ) : (
            <input
              className="text-input"
              type={f.kind === 'datetime' ? 'datetime-local' : f.kind === 'number' ? 'number' : 'text'}
              placeholder={f.label}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          )}
        </div>
      ))}
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-accent" disabled={saving} onClick={save}>
          {saving ? 'Зберігаємо…' : 'Зберегти'}
        </button>
        <button type="button" className="btn-outline" onClick={onCancel}>
          Скасувати
        </button>
      </div>
    </div>
  );
}

function EventDetailView({ eventId, onBack, onCancelled }: { eventId: number; onBack: () => void; onCancelled: () => void }) {
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [invitees, setInvitees] = useState<EventInvitee[]>([]);
  const [addingClients, setAddingClients] = useState(false);
  const [toInvite, setToInvite] = useState<ClientSearchResult[]>([]);
  const [editing, setEditing] = useState(false);

  const load = () => {
    api.adminGetEvent(eventId).then((res) => {
      setEvent(res.event);
      setInvitees(res.invitees);
    });
  };

  useEffect(load, [eventId]);

  const invite = async () => {
    if (toInvite.length === 0) return;
    await api.adminInviteClients(eventId, toInvite.map((c) => c.id));
    setToInvite([]);
    setAddingClients(false);
    load();
  };

  const cancelEvent = async () => {
    if (!confirm('Скасувати цю зустріч? Усіх запрошених клієнтів буде повідомлено.')) return;
    await api.adminCancelEvent(eventId);
    onCancelled();
  };

  const markAttendance = async (clientId: number, attended: boolean) => {
    await api.adminMarkAttendance(eventId, clientId, attended);
    load();
  };

  if (!event) {
    return (
      <div className="screen-center">
        <span>Завантаження…</span>
      </div>
    );
  }

  const isPast = new Date(event.start_at).getTime() < Date.now();
  const rsvpLabel: Record<string, string> = { going: 'Буде', declined: 'Не зможе', '': 'Очікує відповіді' };

  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onBack} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <p className="declaration-title">{event.title}</p>
          <p className="declaration-subtitle">{fmtDateTime(event.start_at)}</p>
        </div>
      </div>

      {editing ? (
        <EditEventForm
          event={event}
          onDone={() => {
            setEditing(false);
            load();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {event.description && <p className="encourage-text">{event.description}</p>}
          {!isPast && (
            <button type="button" className="btn-outline" onClick={() => setEditing(true)}>
              ✏️ Змінити
            </button>
          )}
        </>
      )}

      <section>
        <h2 className="section-title">Запрошені ({invitees.length})</h2>
        <div className="card-list">
          {invitees.map((inv, i) => (
            <div key={inv.client_id}>
              {i > 0 && <div className="card-list-divider" />}
              <div className="card-list-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <p className="row-value">{inv.full_name}</p>
                  <p className="row-label">
                    {inv.phone} · {rsvpLabel[inv.rsvp]}
                  </p>
                </div>
                {isPast && inv.rsvp === 'going' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className={inv.attended === true ? 'btn-accent' : 'btn-outline'}
                      onClick={() => markAttendance(inv.client_id, true)}
                    >
                      Був(ла)
                    </button>
                    <button
                      type="button"
                      className={inv.attended === false ? 'btn-accent' : 'btn-outline'}
                      onClick={() => markAttendance(inv.client_id, false)}
                    >
                      Не був(ла)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {invitees.length === 0 && <p className="placeholder-description" style={{ padding: 16 }}>Ще нікого не запрошено</p>}
        </div>
      </section>

      {!addingClients ? (
        <button type="button" className="complaint-trigger" onClick={() => setAddingClients(true)}>
          <span className="row-icon" style={{ background: 'var(--tg-blue-bg)', color: 'var(--tg-accent)' }}>
            <Plus size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="row-value">Запросити ще клієнтів</p>
          </div>
        </button>
      ) : (
        <div className="complaint-form">
          <ClientPicker selected={toInvite} onChange={setToInvite} />
          <button type="button" className="btn-accent" onClick={invite}>
            Запросити ({toInvite.length})
          </button>
        </div>
      )}

      {!isPast && (
        <button type="button" className="btn-outline" style={{ color: 'var(--tg-red)', borderColor: 'var(--tg-red)' }} onClick={cancelEvent}>
          Скасувати зустріч
        </button>
      )}
    </div>
  );
}

// ---- Клієнти ----

const CLIENT_FILTERS: { value: ClientConferenceFilter; label: string }[] = [
  { value: 'all', label: 'Всі клієнти' },
  { value: 'completed', label: 'Пройшли всі конфи' },
  { value: 'active', label: 'Активні (є майбутні)' },
  { value: 'never', label: 'Не були ні на одній' },
];

function ClientsMenuView({ onSelect, onBack }: { onSelect: (f: ClientConferenceFilter) => void; onBack: () => void }) {
  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onBack} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <p className="declaration-title">Клієнти</p>
      </div>
      <div className="card-list">
        {CLIENT_FILTERS.map((f, i) => (
          <div key={f.value}>
            {i > 0 && <div className="card-list-divider" />}
            <button type="button" className="admin-client-row" onClick={() => onSelect(f.value)}>
              <p className="row-value">{f.label}</p>
              <ChevronRight size={18} color="var(--tg-muted)" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsListView({ filter, onOpen, onBack }: { filter: ClientConferenceFilter; onOpen: (id: number) => void; onBack: () => void }) {
  const [clients, setClients] = useState<AdminClientRow[] | null>(null);

  useEffect(() => {
    setClients(null);
    api.adminListClients(filter).then((res) => setClients(res.clients));
  }, [filter]);

  const title = CLIENT_FILTERS.find((f) => f.value === filter)?.label ?? 'Клієнти';

  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onBack} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <p className="declaration-title">{title}</p>
          {clients && <p className="declaration-subtitle">Всього: {clients.length}</p>}
        </div>
      </div>
      {clients === null ? (
        <p className="placeholder-description">Завантаження…</p>
      ) : clients.length === 0 ? (
        <p className="placeholder-description">Нікого не знайдено</p>
      ) : (
        <div className="card-list">
          {clients.map((c, i) => (
            <div key={c.id}>
              {i > 0 && <div className="card-list-divider" />}
              <button type="button" className="admin-client-row" onClick={() => onOpen(c.id)}>
                <div>
                  <p className="row-value">
                    {c.full_name} {c.blocked && '🚫'}
                  </p>
                  <p className="row-label">
                    {c.phone} · {c.attended_count} конф.
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientDetailView({ clientId, onBack }: { clientId: number; onBack: () => void }) {
  const [detail, setDetail] = useState<AdminClientDetail | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.adminGetClient(clientId).then(setDetail);
  };

  useEffect(load, [clientId]);

  const toggleBlock = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      if (detail.client.blocked) {
        await api.adminUnblockClient(clientId);
      } else {
        await api.adminBlockClient(clientId);
      }
      load();
    } finally {
      setBusy(false);
    }
  };

  if (!detail) {
    return (
      <div className="screen-center">
        <span>Завантаження…</span>
      </div>
    );
  }

  const { client, stats } = detail;

  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onBack} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <p className="declaration-title">{client.full_name}</p>
          <p className="declaration-subtitle">
            {client.phone} · {client.blocked ? '🚫 Заблокований' : '✅ Активний'}
          </p>
        </div>
      </div>

      <section>
        <h2 className="section-title">Статистика</h2>
        <div className="card-list">
          <div className="card-list-row" style={{ justifyContent: 'space-between' }}>
            <p className="row-label">Відвідано конференцій</p>
            <p className="row-value">{stats.attended_count}</p>
          </div>
          <div className="card-list-divider" />
          <div className="card-list-row" style={{ justifyContent: 'space-between' }}>
            <p className="row-label">Підтверджено майбутніх</p>
            <p className="row-value">{stats.confirmed_count}</p>
          </div>
          <div className="card-list-divider" />
          <div className="card-list-row" style={{ justifyContent: 'space-between' }}>
            <p className="row-label">Пройдено типів</p>
            <p className="row-value">
              {stats.completed_types}/{stats.total_types}
            </p>
          </div>
        </div>
      </section>

      {stats.attended_events.length > 0 && (
        <section>
          <h2 className="section-title">Відвідані конференції</h2>
          <div className="card-list">
            {stats.attended_events.map((e, i) => (
              <div key={e.event_id}>
                {i > 0 && <div className="card-list-divider" />}
                <div className="card-list-row">
                  <p className="row-value">{e.title}</p>
                  <p className="row-label">{fmtDateTime(e.start_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.confirmed_events.length > 0 && (
        <section>
          <h2 className="section-title">Підтверджені майбутні</h2>
          <div className="card-list">
            {stats.confirmed_events.map((e, i) => (
              <div key={e.event_id}>
                {i > 0 && <div className="card-list-divider" />}
                <div className="card-list-row">
                  <p className="row-value">{e.title}</p>
                  <p className="row-label">{fmtDateTime(e.start_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        className="btn-outline"
        style={client.blocked ? undefined : { color: 'var(--tg-red)', borderColor: 'var(--tg-red)' }}
        disabled={busy}
        onClick={toggleBlock}
      >
        {client.blocked ? '✅ Розблокувати розсилки' : '🚫 Заблокувати від розсилок'}
      </button>
    </div>
  );
}

// ---- Кастомна конференція ----

function CustomConferenceView({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [durationMin, setDurationMin] = useState(30);
  const [link, setLink] = useState('');
  const [phonesText, setPhonesText] = useState('');
  const [lookup, setLookup] = useState<{ matched: { id: number; full_name: string; phone: string }[]; unmatched: string[] } | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPhones = async () => {
    const phones = phonesText.split(/[\n,;]+/).map((p) => p.trim()).filter(Boolean);
    if (phones.length === 0) return;
    setChecking(true);
    setError(null);
    try {
      const res = await api.adminLookupPhones(phones);
      setLookup(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося перевірити номери');
    } finally {
      setChecking(false);
    }
  };

  const submit = async () => {
    if (!title.trim() || !startAt || !lookup || lookup.matched.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.adminCreateEvent({
        type_code: null,
        title: title.trim(),
        description: description.trim() || undefined,
        start_at: new Date(startAt).toISOString(),
        duration_min: durationMin,
        format: 'video',
        link: link.trim() || undefined,
        client_ids: lookup.matched.map((c) => c.id),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося створити конференцію');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onCancel} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <p className="declaration-title">Кастомна конференція</p>
      </div>

      <div className="register-form">
        <input className="text-input" placeholder="Назва" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="complaint-textarea" placeholder="Опис" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="text-input" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        <input
          className="text-input"
          type="number"
          placeholder="Тривалість (хв)"
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value) || 30)}
        />
        <input className="text-input" placeholder="Посилання на зустріч" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>

      <section>
        <h2 className="section-title">Номери телефонів</h2>
        <textarea
          className="complaint-textarea"
          placeholder={'Кожен номер з нового рядка або через кому\n380671234567\n380952345678'}
          value={phonesText}
          onChange={(e) => {
            setPhonesText(e.target.value);
            setLookup(null);
          }}
        />
        <button type="button" className="btn-outline" disabled={checking || !phonesText.trim()} onClick={checkPhones}>
          {checking ? 'Перевіряємо…' : 'Перевірити номери'}
        </button>

        {lookup && (
          <div className="card-list" style={{ marginTop: 8 }}>
            {lookup.matched.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <div className="card-list-divider" />}
                <div className="card-list-row" style={{ justifyContent: 'space-between' }}>
                  <p className="row-value">
                    ✅ {c.full_name} ({c.phone})
                  </p>
                </div>
              </div>
            ))}
            {lookup.unmatched.map((p, i) => (
              <div key={`u-${i}`}>
                {(i > 0 || lookup.matched.length > 0) && <div className="card-list-divider" />}
                <div className="card-list-row">
                  <p className="row-label">❌ {p} — не знайдено в базі</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="form-error">{error}</p>}
      <button
        type="button"
        className="btn-accent btn-accent--block"
        disabled={submitting || !lookup || lookup.matched.length === 0}
        onClick={submit}
      >
        {submitting ? 'Створюємо…' : lookup ? `Створити та надіслати (${lookup.matched.length})` : 'Спершу перевірте номери'}
      </button>
    </div>
  );
}

// ---- Event list ----

function EventListView({
  onOpen,
  onCreate,
  onCustom,
  onClients,
}: {
  onOpen: (id: number) => void;
  onCreate: () => void;
  onCustom: () => void;
  onClients: () => void;
}) {
  const [upcoming, setUpcoming] = useState<AdminEvent[] | null>(null);
  const [past, setPast] = useState<AdminEvent[] | null>(null);

  const load = () => {
    api.adminListEvents(true).then((res) => setUpcoming(res.events));
    api.adminListEvents(false).then((res) => setPast(res.events));
  };

  useEffect(load, []);

  const renderList = (events: AdminEvent[]) => (
    <div className="card-list">
      {events.map((e, i) => (
        <div key={e.event_id}>
          {i > 0 && <div className="card-list-divider" />}
          <button type="button" className="admin-client-row" onClick={() => onOpen(e.event_id)}>
            <div>
              <p className="row-value">{e.title}</p>
              <p className="row-label">{fmtDateTime(e.start_at)}</p>
            </div>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="screen">
      <p className="hero-title" style={{ color: 'var(--tg-text)' }}>
        Адмін-панель зустрічей
      </p>

      <button type="button" className="btn-accent btn-accent--block" onClick={onCreate}>
        <Plus size={18} aria-hidden="true" />
        Нова зустріч
      </button>
      <button type="button" className="btn-outline" onClick={onCustom}>
        <Phone size={16} aria-hidden="true" />
        Кастомна конференція
      </button>
      <button type="button" className="btn-outline" onClick={onClients}>
        <Users size={16} aria-hidden="true" />
        Клієнти
      </button>

      <section>
        <h2 className="section-title">Майбутні</h2>
        {upcoming === null ? (
          <p className="placeholder-description">Завантаження…</p>
        ) : upcoming.length === 0 ? (
          <p className="placeholder-description">Немає запланованих зустрічей</p>
        ) : (
          renderList(upcoming)
        )}
      </section>

      <section>
        <h2 className="section-title">Минулі</h2>
        {past === null ? (
          <p className="placeholder-description">Завантаження…</p>
        ) : past.length === 0 ? (
          <p className="placeholder-description">Ще не було зустрічей</p>
        ) : (
          renderList(past)
        )}
      </section>
    </div>
  );
}

// ---- Root ----

type View =
  | { name: 'list' }
  | { name: 'create' }
  | { name: 'detail'; eventId: number }
  | { name: 'custom' }
  | { name: 'clients-menu' }
  | { name: 'clients-list'; filter: ClientConferenceFilter }
  | { name: 'client-detail'; clientId: number };

export function AdminConferences() {
  const [view, setView] = useState<View>({ name: 'list' });
  const [refreshKey, setRefreshKey] = useState(0);

  const backToList = () => {
    setRefreshKey((k) => k + 1);
    setView({ name: 'list' });
  };

  if (view.name === 'create') {
    return <CreateEventView onDone={backToList} onCancel={() => setView({ name: 'list' })} />;
  }
  if (view.name === 'custom') {
    return <CustomConferenceView onDone={backToList} onCancel={() => setView({ name: 'list' })} />;
  }
  if (view.name === 'detail') {
    return <EventDetailView eventId={view.eventId} onBack={backToList} onCancelled={backToList} />;
  }
  if (view.name === 'clients-menu') {
    return <ClientsMenuView onSelect={(filter) => setView({ name: 'clients-list', filter })} onBack={() => setView({ name: 'list' })} />;
  }
  if (view.name === 'clients-list') {
    return (
      <ClientsListView
        filter={view.filter}
        onOpen={(clientId) => setView({ name: 'client-detail', clientId })}
        onBack={() => setView({ name: 'clients-menu' })}
      />
    );
  }
  if (view.name === 'client-detail') {
    return <ClientDetailView clientId={view.clientId} onBack={() => setView({ name: 'clients-menu' })} />;
  }
  return (
    <EventListView
      key={refreshKey}
      onOpen={(eventId) => setView({ name: 'detail', eventId })}
      onCreate={() => setView({ name: 'create' })}
      onCustom={() => setView({ name: 'custom' })}
      onClients={() => setView({ name: 'clients-menu' })}
    />
  );
}
