import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Plus, Search, X } from 'lucide-react';
import { api } from '../api/client';
import type { AdminEvent, ClientSearchResult, ConferenceFormat, EventInvitee, EventType } from '../api/types';
import './AdminConferences.css';

const FORMAT_OPTIONS: { value: ConferenceFormat; label: string }[] = [
  { value: 'video', label: 'Відеозустріч' },
  { value: 'phone', label: 'Телефонна розмова' },
  { value: 'office', label: 'Зустріч в офісі' },
];

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
  const [format, setFormat] = useState<ConferenceFormat>('video');
  const [link, setLink] = useState('');
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('');
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
        format,
        link: link.trim() || undefined,
        person_name: personName.trim() || undefined,
        person_role: personRole.trim() || undefined,
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
        <select className="text-input" value={format} onChange={(e) => setFormat(e.target.value as ConferenceFormat)}>
          {FORMAT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <input className="text-input" placeholder="Посилання на зустріч" value={link} onChange={(e) => setLink(e.target.value)} />
        <input className="text-input" placeholder="Ім'я юриста" value={personName} onChange={(e) => setPersonName(e.target.value)} />
        <input className="text-input" placeholder="Посада" value={personRole} onChange={(e) => setPersonRole(e.target.value)} />
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

function EventDetailView({ eventId, onBack, onCancelled }: { eventId: number; onBack: () => void; onCancelled: () => void }) {
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [invitees, setInvitees] = useState<EventInvitee[]>([]);
  const [addingClients, setAddingClients] = useState(false);
  const [toInvite, setToInvite] = useState<ClientSearchResult[]>([]);

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

      {event.description && <p className="encourage-text">{event.description}</p>}

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
                    <button type="button" className="btn-outline" onClick={() => markAttendance(inv.client_id, true)}>
                      Був(ла)
                    </button>
                    <button type="button" className="btn-outline" onClick={() => markAttendance(inv.client_id, false)}>
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

// ---- Event list ----

function EventListView({ onOpen, onCreate }: { onOpen: (id: number) => void; onCreate: () => void }) {
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

type View = { name: 'list' } | { name: 'create' } | { name: 'detail'; eventId: number };

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
  if (view.name === 'detail') {
    return <EventDetailView eventId={view.eventId} onBack={backToList} onCancelled={backToList} />;
  }
  return <EventListView key={refreshKey} onOpen={(eventId) => setView({ name: 'detail', eventId })} onCreate={() => setView({ name: 'create' })} />;
}
