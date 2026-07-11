import { FileText, Home, MessageCircle, User, Video } from 'lucide-react';
import './TabBar.css';

export type TabKey = 'home' | 'documents' | 'chat' | 'conferences' | 'cabinet';

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Головна', icon: Home },
  { key: 'documents', label: 'Документи', icon: FileText },
  { key: 'chat', label: 'Чат', icon: MessageCircle },
  { key: 'conferences', label: 'Зустрічі', icon: Video },
  { key: 'cabinet', label: 'Кабінет', icon: User },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <nav aria-label="Головна навігація" className="tab-bar">
      <ul className="tab-bar-list">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} className="tab-bar-item">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? 'page' : undefined}
                className={`tab-bar-button${isActive ? ' tab-bar-button--active' : ''}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
