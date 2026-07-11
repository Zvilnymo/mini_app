import { CalendarClock } from 'lucide-react';

export function Conferences() {
  return (
    <div className="placeholder-block">
      <span className="placeholder-icon">
        <CalendarClock size={32} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="placeholder-title">Скоро</p>
      <p className="placeholder-description">Розділ «Зустрічі» ще в розробці.</p>
    </div>
  );
}
