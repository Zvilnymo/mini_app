import { useState } from 'react';
import { api, type ScreeningAnswers } from '../api/client';

const QUESTIONS: { key: keyof ScreeningAnswers; text: string }[] = [
  {
    key: 'hasGamblingCrypto',
    text: "Чи користувалися Ви онлайн-казино, букмекерськими ставками або інвестували в криптовалюту / біржі?",
  },
  {
    key: 'isFraudVictim',
    text: "Чи ставали Ви жертвою шахрайських дій, пов'язаних із грошовими коштами?",
  },
  {
    key: 'hasSoldProperty',
    text: 'Чи продавали Ви протягом останніх трьох років рухоме або нерухоме майно?',
  },
  {
    key: 'incomeOver30k',
    text: 'Чи перевищує Ваш середній щомісячний дохід 30 000 грн?',
  },
];

export function Screening({ onDone, title }: { onDone: () => void; title?: string }) {
  const [answers, setAnswers] = useState<Partial<Record<keyof ScreeningAnswers, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== undefined);

  const submit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitScreening(answers as ScreeningAnswers);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося зберегти анкету');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div>
        <p className="hero-eyebrow" style={{ color: 'var(--tg-muted)' }}>
          {title ?? 'Коротка анкета'}
        </p>
        <p style={{ marginTop: 4, fontSize: 20, fontWeight: 600, color: 'var(--tg-text)' }}>
          Дайте відповідь на кілька запитань
        </p>
      </div>

      {QUESTIONS.map((q) => (
        <div key={q.key} className="card">
          <p style={{ fontSize: 15, lineHeight: 1.4, color: 'var(--tg-text)' }}>{q.text}</p>
          <div className="screening-toggle">
            <button
              type="button"
              className={`screening-toggle-btn${answers[q.key] === true ? ' screening-toggle-btn--active' : ''}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: true }))}
            >
              Так
            </button>
            <button
              type="button"
              className={`screening-toggle-btn${answers[q.key] === false ? ' screening-toggle-btn--active' : ''}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: false }))}
            >
              Ні
            </button>
          </div>
        </div>
      ))}

      {error && <p className="form-error">{error}</p>}

      <button type="button" className="btn-accent btn-accent--block" disabled={!allAnswered || submitting} onClick={submit}>
        {submitting ? 'Зберігаємо…' : 'Продовжити'}
      </button>
    </div>
  );
}
