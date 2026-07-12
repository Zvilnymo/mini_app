import { useState } from 'react';
import { api } from '../api/client';
import logo from '../assets/logo.png';
import './Register.css';

export function Register({ onRegistered }: { onRegistered: () => void }) {
  const [phone, setPhone] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const submit = async () => {
    if (!phone.trim()) return;
    setRegistering(true);
    setRegisterError(null);
    try {
      await api.register(phone.trim());
      onRegistered();
    } catch (e) {
      setRegisterError(e instanceof Error ? e.message : 'Помилка реєстрації');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="register">
      <img src={logo} alt="Звільнимо" className="register-logo" />
      <p className="register-title">Ласкаво просимо</p>
      <p className="register-subtitle">
        Введіть номер телефону, який ви використовували при спілкуванні з компанією або підписанні договору
      </p>
      <div className="register-form">
        <input
          className="text-input"
          placeholder="+380XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoFocus
        />
        <button type="button" className="btn-accent btn-accent--block" disabled={registering} onClick={submit}>
          {registering ? 'Зачекайте…' : 'Продовжити'}
        </button>
        {registerError && <p className="form-error">{registerError}</p>}
      </div>
    </div>
  );
}
