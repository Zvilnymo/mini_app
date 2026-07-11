import { MessageCircle } from 'lucide-react';

export function Chat() {
  return (
    <div className="placeholder-block">
      <span className="placeholder-icon">
        <MessageCircle size={32} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="placeholder-title">Скоро</p>
      <p className="placeholder-description">Розділ «Чат» ще в розробці.</p>
    </div>
  );
}
