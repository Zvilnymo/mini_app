import { useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { useMe } from '../api/hooks';
import { Screening } from '../screens/Screening';
import { Splash } from './Splash';

export function AppGate({ children }: { children: ReactNode }) {
  const { data, loading, error, refetch } = useMe();
  const [phone, setPhone] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  if (loading) {
    return <Splash />;
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

  if (!data) return null;

  if (!data.registered) {
    const submit = async () => {
      if (!phone.trim()) return;
      setRegistering(true);
      setRegisterError(null);
      try {
        await api.register(phone.trim());
        refetch();
      } catch (e) {
        setRegisterError(e instanceof Error ? e.message : 'Помилка реєстрації');
      } finally {
        setRegistering(false);
      }
    };

    return (
      <div className="placeholder-block">
        <p className="placeholder-title">Ласкаво просимо</p>
        <p className="placeholder-description">
          Щоб побачити особистий кабінет, вкажіть номер телефону, яким ви реєструвались у Zvilnymo.
        </p>
        <div className="register-form" style={{ width: '100%' }}>
          <input
            className="text-input"
            placeholder="+380XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />
          <button type="button" className="btn-accent btn-accent--block" disabled={registering} onClick={submit}>
            {registering ? 'Зачекайте…' : 'Продовжити'}
          </button>
          {registerError && <p className="form-error">{registerError}</p>}
        </div>
      </div>
    );
  }

  if (!data.screening_completed) {
    return <Screening onDone={refetch} title="Останній крок реєстрації" />;
  }

  return <>{children}</>;
}
