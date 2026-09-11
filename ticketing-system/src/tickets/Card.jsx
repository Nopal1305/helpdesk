import { useState } from 'react';
import PriorityBadge from './PriorityBadge';
import { STATUS } from '../lib/constants';

export default function TicketDetail({ ticket, onBack, onStatusChange, userRole = 'employee' }) {
  const [statusRequest, setStatusRequest] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [note, setNote] = useState('');

  if (!ticket) return null;

  const safeStatus = String(ticket.status ?? 'OPEN').toUpperCase();
  
  const getStatusStyle = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            &larr; Back to tickets
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ticket #{ticket.code || ticket.id}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {ticket.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(safeStatus)}`}>
            {safeStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <section className="flex h-fit flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Description
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {ticket.description || 'No description provided.'}
          </p>

          {ticket.resolutionNote && (
            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-800">
                Resolution Note
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-green-900">
                {ticket.resolutionNote}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6">
            {userRole === 'it_staff' && safeStatus === 'OPEN' && (
              <button
                type="button"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={statusRequest !== null}
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {statusRequest === 'IN_PROGRESS' ? 'Processing...' : 'Claim & Start Working'}
              </button>
            )}

            {userRole === 'it_staff' && safeStatus === 'IN_PROGRESS' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Tindakan Penyelesaian (Resolution Note)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ketik tindakan perbaikan yang telah dilakukan..."
                  className="block w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="4"
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={statusRequest !== null || !note.trim()}
                  className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusRequest === 'RESOLVED' ? 'Saving...' : 'Mark as Resolved'}
                </button>
              </div>
            )}
            
            {userRole !== 'it_staff' && safeStatus !== 'RESOLVED' && (
              <p className="text-center text-sm text-slate-500">Only IT Staf can update ticket status</p>
            )}
          </div>

          {statusError ? <p className="mt-4 text-sm font-bold text-red-600">{statusError}</p> : null}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Details
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{ticket.category || ticket.department || 'Other'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{ticket.reporterDept}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reporter</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{ticket.reporter}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignee</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {ticket.assignee 
                  ? `${ticket.assignee}${ticket.assignee_specialization ? ` (${ticket.assignee_specialization})` : ''}` 
                  : 'Unassigned'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}