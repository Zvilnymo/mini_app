export type PillTone = 'green' | 'red' | 'orange' | 'blue' | 'muted';

const TONE_STYLE: Record<PillTone, { background: string; color: string }> = {
  green: { background: 'var(--tg-green-bg)', color: 'var(--tg-green)' },
  red: { background: 'var(--tg-red-bg)', color: 'var(--tg-red)' },
  orange: { background: 'var(--tg-orange-bg)', color: 'var(--tg-orange)' },
  blue: { background: 'var(--tg-blue-bg)', color: 'var(--tg-accent)' },
  muted: { background: 'var(--tg-bg)', color: 'var(--tg-muted)' },
};

export function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
        ...TONE_STYLE[tone],
      }}
    >
      {label}
    </span>
  );
}
