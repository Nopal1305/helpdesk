import { TICKET_FILTERS } from '../lib/constants';

export default function FilterBar({ activeFilter, onChange }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 border-2 border-ink bg-paper p-3 shadow-brutal-sm">
      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
        Filter
      </span>

      {TICKET_FILTERS.map((filter) => {
        const isActive = activeFilter === filter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange?.(filter)}
            className={[
              'border-2 cursor-pointer px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-transform duration-150 hover:-translate-y-1 active:translate-y-0',
              isActive
                ? 'border-ink bg-signal text-paper shadow-brutal-sm hover:shadow-lg'
                : 'border-ink bg-paper text-ink hover:shadow-md',
            ].join(' ')}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
