import { useState } from 'react';
import { CalendarClock, MapPin, Phone, Star, Video } from 'lucide-react';
import { api } from '../api/client';
import { useConferences } from '../api/hooks';
import type { ConferenceEvent, ConferenceFormat } from '../api/types';

const FORMAT_META: Record<ConferenceFormat, { icon: typeof Video; label: string }> = {
  video: { icon: Video, label: 'Відеозустріч' },
  phone: { icon: Phone, label: 'Телефонна розмова' },
  office: { icon: MapPin, label: 'Зустріч в офісі' },
};

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }),
    time: d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
  };
}

function FeedbackForm({ event, onSent }: { event: ConferenceEvent; onSent: () => void }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!stars) return;
    setSubmitting(true);
    try {
      await api.submitConferenceFeedback(event.event_id, stars, comment.trim());
      onSent();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="conf-feedback">
      <p className="conf-feedback-label">Як пройшла зустріч?</p>
      <div className="conf-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="conf-star-btn"
            onClick={() => setStars(n)}
            aria-label={`${n} з 5`}
          >
            <Star size={24} fill={n <= stars ? 'var(--tg-orange)' : 'none'} color="var(--tg-orange)" aria-hidden="true" />
          </button>
        ))}
      </div>
      {stars > 0 && (
        <>
          <textarea
            className="complaint-textarea"
            placeholder="Коментар (необов'язково)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="button" className="btn-accent" disabled={submitting} onClick={submit}>
            {submitting ? 'Надсилаємо…' : 'Залишити відгук'}
          </button>
        </>
      )}
    </div>
  );
}

function ConferenceCard({ event, onChanged }: { event: ConferenceEvent; onChanged: () => void }) {
  const { icon: Icon, label } = FORMAT_META[event.format] ?? FORMAT_META.video;
  const { date, time } = formatDateTime(event.start_at);
  const isPast = new Date(event.start_at).getTime() < Date.now();
  const [responding, setResponding] = useState(false);

  const respond = async (rsvp: 'going' | 'declined') => {
    setResponding(true);
    try {
      await api.submitConferenceRsvp(event.event_id, rsvp);
      onChanged();
    } finally {
      setResponding(false);
    }
  };

  let statusTint: { background: string; color: string };
  let statusLabel: string;
  if (isPast) {
    statusTint = { background: 'var(--tg-green-bg)', color: 'var(--tg-green)' };
    statusLabel = 'Завершено';
  } else if (event.rsvp === 'going') {
    statusTint = { background: 'var(--tg-blue-bg)', color: 'var(--tg-accent)' };
    statusLabel = 'Заплановано';
  } else if (event.rsvp === 'declined') {
    statusTint = { background: 'var(--tg-red-bg)', color: 'var(--tg-red)' };
    statusLabel = 'Відхилено';
  } else {
    statusTint = { background: 'var(--tg-orange-bg)', color: 'var(--tg-orange)' };
    statusLabel = 'Очікує відповіді';
  }

  return (
    <div className="card">
      <div className="doc-card-top">
        <span className="doc-icon" style={!isPast && event.rsvp === 'going' ? { background: 'var(--tg-blue-bg)', color: 'var(--tg-accent)' } : { background: 'var(--tg-bg)', color: 'var(--tg-muted)' }}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="doc-title-row">
            <div>
              <p className="doc-title">
                {date}, {time}
              </p>
              <p className="row-label">{label}</p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                flexShrink: 0,
                alignItems: 'center',
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 500,
                ...statusTint,
              }}
            >
              {statusLabel}
            </span>
          </div>
          {event.person_name && (
            <p className="row-value" style={{ marginTop: 8 }}>
              <span className="row-label">Юрист: </span>
              {event.person_name}
            </p>
          )}
          {event.person_role && <p className="row-label">{event.person_role}</p>}

          {!isPast && event.rsvp === '' && (
            <div className="conf-rsvp-row">
              <button type="button" className="btn-accent" disabled={responding} onClick={() => respond('going')}>
                ✅ Буду
              </button>
              <button type="button" className="btn-outline" disabled={responding} onClick={() => respond('declined')}>
                ❌ Не зможу
              </button>
            </div>
          )}

          {!isPast && event.rsvp === 'going' && event.link && (
            <a href={event.link} target="_blank" rel="noreferrer" className="btn-accent btn-accent--block" style={{ marginTop: 12, textDecoration: 'none' }}>
              <Video size={18} aria-hidden="true" />
              Приєднатися
            </a>
          )}

          {isPast && event.rsvp === 'going' && event.feedback_stars == null && (
            <FeedbackForm event={event} onSent={onChanged} />
          )}
          {isPast && event.feedback_stars != null && (
            <p className="conf-feedback-sent">Дякуємо за відгук! {'⭐'.repeat(event.feedback_stars)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Conferences() {
  const { data, loading, error, refetch } = useConferences();

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
        <p className="placeholder-title">Не вдалося завантажити зустрічі</p>
        <p className="placeholder-description">{error}</p>
        <button type="button" className="btn-outline" style={{ marginTop: 16 }} onClick={refetch}>
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="placeholder-block">
        <span className="placeholder-icon">
          <CalendarClock size={32} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="placeholder-title">У вас поки немає запланованих консультацій</p>
        <p className="placeholder-description">Ми повідомимо вас, щойно менеджер призначить зустріч.</p>
      </div>
    );
  }

  const now = Date.now();
  const upcoming = data.filter((e) => new Date(e.start_at).getTime() >= now).sort((a, b) => a.start_at.localeCompare(b.start_at));
  const past = data.filter((e) => new Date(e.start_at).getTime() < now).sort((a, b) => b.start_at.localeCompare(a.start_at));

  return (
    <div className="screen">
      {upcoming.length > 0 && (
        <section>
          <h2 className="section-title">Найближчі</h2>
          <div className="doc-group">
            {upcoming.map((e) => (
              <ConferenceCard key={e.event_id} event={e} onChanged={refetch} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="section-title">Минулі</h2>
          <div className="doc-group">
            {past.map((e) => (
              <ConferenceCard key={e.event_id} event={e} onChanged={refetch} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
