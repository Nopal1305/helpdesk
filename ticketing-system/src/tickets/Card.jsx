import PriorityBadge from './PriorityBadge';

function Card({ ticket, onSelect, selected = false }) {
  const priority = String(ticket.priority ?? 'MEDIUM').toUpperCase();
  const status = String(ticket.status ?? 'OPEN').toUpperCase();

  return (
    <button
      type="button"
      onClick={() => onSelect?.(ticket.id)}
      className={[
        'group w-full cursor-pointer border-2 border-ink bg-paper text-left shadow-[4px_4px_0_#151515] transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_#151515] active:translate-y-0',
        selected ? 'ring-4 ring-signal ring-offset-2 ring-offset-[#f8f4ee]' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 border-b-2 border-ink bg-ink p-4 text-paper">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
            Ticket #{ticket.code || ticket.id}
          </p>
          <h3 className="mt-2 font-display text-xl font-bold leading-tight text-paper">
            {ticket.title}
          </h3>
        </div>

        <PriorityBadge priority={priority} />
      </div>

      <div className="space-y-4 p-4">
        <p className="text-sm leading-6 text-ink/80">{ticket.summary || ticket.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border-2 border-ink bg-signal px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
            {ticket.department || ticket.category || 'Other'}
          </span>
          <span className="border-2 border-ink bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper">
            {status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-end justify-between border-t-2 border-ink pt-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
              Assignee
            </p>
            <p className="mt-1 font-display text-base font-bold text-ink">
              {ticket.assignee || 'Unassigned'}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default Card;