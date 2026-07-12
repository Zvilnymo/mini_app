import type { ReactNode } from 'react';
import { useMe } from '../api/hooks';
import { Screening } from '../screens/Screening';
import { Register } from './Register';
import { Splash } from './Splash';

export function AppGate({ children }: { children: ReactNode }) {
  const { data, loading, error, refetch } = useMe();

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
    return <Register onRegistered={refetch} />;
  }

  if (!data.screening_completed) {
    return <Screening onDone={refetch} title="Останній крок реєстрації" />;
  }

  return <>{children}</>;
}
