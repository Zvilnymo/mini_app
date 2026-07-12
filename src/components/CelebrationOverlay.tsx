import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Gift, Sparkles, X, Headphones } from 'lucide-react';
import director from '../assets/director.png';
import './CelebrationOverlay.css';

const DIRECTOR = {
  name: 'Олег Болотський',
  role: 'Керівник ЮК «Звільнимо»',
  paragraphs: [
    'Вітаю вас особисто! Ви зробили найважливіше — зібрали та подали всі документи. Це серйозний крок, і ви впорались на відмінно.',
    'Дякую за вашу довіру та відповідальність. Тепер естафета переходить до нашої команди — і повірте, ми вас не підведемо.',
    'Попереду підготовка й подання заяви до суду. Ви стали на крок ближче до фінансової свободи, а решту роботи ми беремо на себе.',
  ],
  bonusNote: 'Ви отримали персональний бонус за завершення етапу. Зверніться до підтримки, щоб забрати його.',
};

export function CelebrationOverlay({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const fire = (originX: number, angle: number) => {
      confetti({
        particleCount: 70,
        spread: 65,
        startVelocity: 45,
        angle,
        origin: { x: originX, y: 0 },
        colors: ['#2aabee', '#2fb457', '#f5a63c', '#ffffff', '#1c8fd0'],
        zIndex: 9999,
        scalar: 0.9,
      });
    };
    fire(0.15, 60);
    fire(0.85, 120);
    const t1 = setTimeout(() => {
      fire(0.3, 70);
      fire(0.7, 110);
    }, 550);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100),
      setTimeout(() => setStage(2), 700),
      setTimeout(() => setStage(3), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="celebration">
      <button type="button" onClick={onClose} aria-label="Закрити" className="celebration-close">
        <X size={20} aria-hidden="true" />
      </button>

      <div className="celebration-scroll">
        <div className={`celebration-hero${stage >= 1 ? ' celebration-hero--in' : ''}`}>
          <span className="celebration-trophy">
            <Trophy size={40} aria-hidden="true" />
            <Sparkles size={22} className="celebration-sparkle" aria-hidden="true" />
          </span>
          <h2 className="celebration-title">Усі документи зібрано!</h2>
          <p className="celebration-subtitle">
            Вітаємо, ви стали на крок ближче до <span className="celebration-highlight">фінансової свободи</span>
          </p>
        </div>

        <div className="card celebration-progress">
          <div className="celebration-progress-top">
            <span>Готовність документів</span>
            <span className="celebration-progress-percent">100%</span>
          </div>
          <div className="success-bar-track">
            <div className="success-bar-fill" style={{ width: stage >= 2 ? '100%' : '62%' }} />
          </div>
        </div>

        <div className={`celebration-director${stage >= 3 ? ' celebration-director--in' : ''}`}>
          <div className="celebration-director-photo-wrap">
            <img src={director} alt={DIRECTOR.name} className="celebration-director-photo" />
          </div>
          <div className="celebration-director-body">
            <p className="celebration-director-name">{DIRECTOR.name}</p>
            <p className="celebration-director-role">{DIRECTOR.role}</p>
            <div className="celebration-director-text">
              {DIRECTOR.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="celebration-director-signature">— {DIRECTOR.name}</p>
          </div>
        </div>

        <div className={`celebration-bonus${stage >= 3 ? ' celebration-bonus--in' : ''}`}>
          <div className="celebration-bonus-top">
            <span className="celebration-bonus-icon">
              <Gift size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="celebration-bonus-title">Ваш бонус чекає!</p>
              <p className="celebration-bonus-text">{DIRECTOR.bonusNote}</p>
            </div>
          </div>
          <button type="button" className="btn-accent btn-accent--block" style={{ marginTop: 14, background: 'var(--tg-green)' }}>
            <Headphones size={18} aria-hidden="true" />
            Звернутися до підтримки
          </button>
        </div>

        <button type="button" className="celebration-back" onClick={onClose}>
          Повернутися до документів
        </button>
      </div>
    </div>
  );
}
