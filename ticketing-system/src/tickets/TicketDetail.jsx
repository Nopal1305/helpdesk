import { useState } from 'react';
import PriorityBadge from './PriorityBadge';
import { STATUS } from '../lib/constants';

export default function TicketDetail({ ticket, onBack, onStatusChange, userRole = 'employee' }) {
  const [statusRequest, setStatusRequest] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [note, setNote] = useState('');

  if (!ticket) return null;

  const safeStatus = String(ticket.status ?? 'OPEN').toUpperCase();
  const statusInfo = STATUS[safeStatus] ?? STATUS.OPEN;
  const statusColor = `bg-${statusInfo.color} text-${statusInfo.color === 'caution' ? 'ink' : 'paper'}`;

  const handleStatusChange = async (status) => {
    if (status === 'RESOLVED' && !note.trim()) {
      setStatusError('Resolution note wajib diisi untuk menyelesaikan tiket!');
      return;
    }
    setStatusRequest(status);
    setStatusError('');

    try {
      await onStatusChange?.(status, note);
      setNote('');
    } catch (error) {
      setStatusError(error.response?.data?.message || error.message || 'Status update failed.');
    } finally {
      setStatusRequest(null);
    }
  };

  return (

    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-2 border-ink bg-ink p-4 text-paper shadow-brutal md:flex-row md:items-start md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 cursor-pointer border-2 border-paper bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-paper transition-all duration-150 hover:-translate-y-0.5 hover:bg-paper hover:text-ink active:translate-y-0"
          >
            ← Back to tickets
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
            Ticket #{ticket.code || ticket.id}
          </p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-paper">
            {ticket.title}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={ticket.priority} />
          <span className={`border-2 border-ink px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${statusColor}`}>
            {safeStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_0.8fr]">
        <section className="h-fit border-2 border-ink bg-paper p-5 shadow-brutal">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
            Description
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/80">{ticket.description || 'No description provided.'}</p>

          {ticket.resolutionNote && (
            <div className="mt-5 border-t-2 border-ink pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70 text-go">Note</p>
              <p className="mt-2 text-sm leading-6 font-medium text-ink">{ticket.resolutionNote}</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {userRole === 'it_staff' && safeStatus !== 'RESOLVED' && (
              <>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ketik tindakan / catatan penyelesaian di sini (wajib untuk Mark Resolved)..."
                  className="w-full border-2 border-ink bg-[#f7f2ea] p-3 text-sm outline-none transition-colors focus:bg-white"
                  row
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={statusRequest !== null}
                  className="cursor-pointer border-2 border-ink bg-go px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-paper shadow-brutal-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
                >
                  {statusRequest === 'RESOLVED' ? 'Saving...' : 'Mark resolved'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={statusRequest !== null}
                  className="cursor-pointer border-2 border-ink bg-caution px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink shadow-brutal-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
                >
                  {statusRequest === 'IN_PROGRESS' ? 'Saving...' : 'In progress'}
                </button>
              </>
            )}
            {userRole !== 'it_staff' && (
              <p className="text-sm text-ink/60">Only IT Staff can update ticket status</p>
            )}
          </div>

          {statusError ? <p className="mt-4 text-sm font-bold text-alert">{statusError}</p> : null}
        </section>

        <aside className="space-y-4">
          <div className="border-2 border-ink bg-paper p-4 shadow-brutal-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70">
              Details
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-ink">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/60">Category</p>
                <p className="mt-0.5 font-display text-base font-bold">{ticket.category || ticket.department || 'Other'}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/60">Assignee</p>
                <p className="mt-0.5 font-display text-base font-bold">{ticket.assignee}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/60">Reporter</p>
                <p className="mt-0.5 font-display text-base font-bold">{ticket.reporter}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/60">Department</p>
                <p className="mt-0.5 font-display text-base font-bold">{ticket.reporterDept}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}