import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../components/Toast';
import type { DeclarationQuestion } from '../api/types';

export function Declaration({ onBack }: { onBack: () => void }) {
  const { showError, showSuccess } = useToast();
  const [questions, setQuestions] = useState<DeclarationQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    api
      .getDeclaration()
      .then((res) => {
        if (cancelled) return;
        setQuestions(res.questions);
        setAnswers(res.answers);
        setCompleted(res.completed);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Не вдалося завантажити анкету');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    if (!questions) return;
    const unanswered = new Set(
      questions.filter((q) => q.required && !(answers[q.key] ?? '').trim()).map((q) => q.key),
    );
    if (unanswered.size > 0) {
      setMissing(unanswered);
      showError("Заповніть, будь ласка, обов'язкові поля.");
      return;
    }
    setMissing(new Set());
    setSaving(true);
    try {
      await api.submitDeclaration(answers);
      setCompleted(true);
      showSuccess('Анкету збережено');
      onBack();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Не вдалося зберегти анкету');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen">
      <div className="declaration-header">
        <button type="button" className="declaration-back" onClick={onBack} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <p className="declaration-title">Анкета декларацій</p>
          <p className="declaration-subtitle">
            {completed ? 'Заповнено — можна змінити відповіді' : "Заповніть, щоб ми могли скласти декларацію"}
          </p>
        </div>
      </div>

      {loading && (
        <div className="screen-center">
          <span>Завантаження…</span>
        </div>
      )}

      {loadError && (
        <div className="placeholder-block">
          <p className="placeholder-title">Не вдалося завантажити анкету</p>
          <p className="placeholder-description">{loadError}</p>
        </div>
      )}

      {questions && (
        <>
          <div className="declaration-fields">
            {questions.map((q, i) => (
              <div className="declaration-field" key={q.key}>
                <p className="declaration-question">
                  <span className="declaration-question-index">{i + 1}.</span> {q.emoji} {q.question}
                  {q.required && <span className="declaration-required">*</span>}
                </p>
                {q.hint && <p className="declaration-hint">{q.hint}</p>}
                <textarea
                  className={`text-input declaration-textarea${missing.has(q.key) ? ' declaration-textarea--error' : ''}`}
                  value={answers[q.key] ?? ''}
                  onChange={(e) => setAnswer(q.key, e.target.value)}
                  placeholder={q.required ? "Обов'язкове питання" : 'Можна пропустити'}
                />
              </div>
            ))}
          </div>

          <button type="button" className="btn-accent btn-accent--block" disabled={saving} onClick={submit}>
            {saving ? 'Зберігаємо…' : 'Зберегти анкету'}
          </button>
        </>
      )}
    </div>
  );
}
