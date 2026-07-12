import { useEffect, useState } from 'react';
import { api } from '../api/client';
import './Splash.css';

/**
 * Mirrors documents_bot's admin deep-link (/start admin_<code>) — opening
 * the mini app via https://t.me/<bot>/<app>?startapp=admin_<code> registers
 * the visiting Telegram user in docbot.admins instead of showing the normal
 * client app, same as the bot's own admin welcome message.
 */
export function AdminRegister({ code }: { code: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .registerAdmin(code)
      .then(() => setStatus('ok'))
      .catch((err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Не вдалося зареєструвати');
      });
  }, [code]);

  return (
    <div className="splash">
      {status === 'loading' && (
        <>
          <div className="splash-spinner" aria-hidden="true" />
          <p className="splash-text">Реєструємо адмін-доступ…</p>
        </>
      )}
      {status === 'ok' && (
        <p className="splash-text">
          ✅ Готово! Сюди приходитимуть сповіщення:
          <br />
          • Нові клієнти (реєстрація)
          <br />
          • Завантажені документи
          <br />
          • Завершення збору документів
        </p>
      )}
      {status === 'error' && <p className="splash-text">⚠️ {error}</p>}
    </div>
  );
}
