export default function Badge({ color = 'ink', children }) {
  const colorClasses = {
    ink:     'bg-ink text-paper',
    alert:   'bg-alert text-paper',
    caution: 'bg-caution text-ink',
    go:      'bg-go text-paper',
    signal:  'bg-signal text-paper',
  };

  return (
    <span
      className={`
        inline-block px-2.5 py-1 
        font-mono text-xs font-bold uppercase tracking-wide
        border-2 border-ink
        -rotate-2
        ${colorClasses[color]}
      `}
    >
      {children}
    </span>
  );
}