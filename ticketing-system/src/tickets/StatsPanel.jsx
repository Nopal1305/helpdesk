import { useMemo } from 'react';

export default function StatsPanel({ tickets = [] }) {
  const stats = useMemo(() => {
    const counts = tickets.reduce((acc, t) => {
      if (t.status === 'OPEN') acc.open++;
      else if (t.status === 'IN_PROGRESS') acc.inProgress++;
      else if (t.status === 'RESOLVED') acc.resolved++;
      return acc;
    }, { open: 0, inProgress: 0, resolved: 0 });

    return [
      { label: 'Open', value: counts.open, accent: 'bg-alert' },
      { label: 'In progress', value: counts.inProgress, accent: 'bg-caution' },
      { label: 'Resolved', value: counts.resolved, accent: 'bg-go' },
    ];
  }, [tickets]);

  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, accent }) => (
        <div key={label} className="border-2 border-ink bg-paper p-4 shadow-brutal-sm">
          <div className={`mb-2 h-2 w-12 border-2 border-ink ${accent}`} />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70">{label}</p>
          <p className="mt-2 font-display text-3xl font-black text-ink">{value}</p>
        </div>
      ))}
    </section>
  );
}
