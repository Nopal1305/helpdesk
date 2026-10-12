import { useMemo, useState, useEffect } from 'react';
import PriorityBadge from './PriorityBadge';

export default function DashboardOverview({ tickets, user, userRole, onTicketSelect, onCreateClick }) {
  const stats = useMemo(() => {
    // Exclude REJECTED and CANCELLED from valid SLA total, but count them for display
    const rejected = tickets.filter(t => t.status === 'REJECTED').length;
    const cancelled = tickets.filter(t => t.status === 'CANCELLED').length;
    const validTickets = tickets.filter(t => t.status !== 'REJECTED' && t.status !== 'CANCELLED');

    const total = validTickets.length;
    const open = validTickets.filter(t => t.status === 'OPEN').length;
    const inProgress = validTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'RE-OPENED').length;
    const pending = validTickets.filter(t => t.status === 'PENDING').length;
    const resolved = validTickets.filter(t => t.status === 'RESOLVED').length;
    const completed = validTickets.filter(t => t.status === 'CLOSED').length;

    const highPriority = validTickets.filter(t => t.priority === 'HIGH').length;
    const mediumPriority = validTickets.filter(t => t.priority === 'MEDIUM').length;
    const lowPriority = validTickets.filter(t => t.priority === 'LOW').length;

    // Dept breakdown (SLA scope only, filtered for IT Staff specialization)
    const byDept = validTickets.reduce((acc, t) => {
      if (userRole === 'it_staff' && user?.specialization) {
        if (String(t.category).toUpperCase() !== String(user.specialization).toUpperCase()) {
          return acc;
        }
      }
      const dept = t.reporterDept || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return { total, open, inProgress, pending, resolved, completed, rejected, cancelled, highPriority, mediumPriority, lowPriority, byDept };
  }, [tickets, userRole, user?.specialization]);

  // Get 5 most recent tickets
  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [tickets]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {user?.login_count > 1 ? 'Welcome back' : 'Welcome'}, {user?.fullname || 'User'}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">Here is the summary of your operational ticketing data.</p>
        </div>

        {userRole === 'employee' && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Create New Ticket
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Total Tickets" count={stats.total} color="bg-slate-800" text="text-white" />
        <StatCard title="Open" count={stats.open} color="bg-blue-100" border="border-blue-200" text="text-blue-800" />
        <StatCard title="In Progress" count={stats.inProgress} color="bg-orange-50" border="border-orange-200" text="text-orange-600" />
        <StatCard title="Resolved" count={stats.resolved} color="bg-green-50" border="border-green-200" text="text-green-700" />
        <StatCard title="Completed" count={stats.completed} color="bg-slate-100" border="border-slate-300" text="text-slate-700" />
      </div>

      <div className="flex flex-col gap-6 mt-8">
        {/* Ticket Resolution - Full Width */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Ticket Resolution</h3>
          <ProgressBar label="Completed Tickets" value={stats.completed} total={stats.total} color="bg-green-500" />
        </div>

        {/* Middle Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Charts & Priority */}
          <div className="flex flex-col gap-6">

            {/* Tickets by Department */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Tickets by Department</h3>

              {Object.keys(stats.byDept).length === 0 ? (
                <div className="text-sm text-slate-500 mt-4 flex items-center justify-center py-10">No data available</div>
              ) : (
                <div className="flex flex-col mt-4 relative w-full">

                  <div className="relative h-[180px] w-full flex items-end justify-around">

                    {/* Background Grid Lines */}
                    <div className="absolute inset-x-0 bottom-[28px] h-[120px] flex flex-col justify-between pointer-events-none z-0">
                      <div className="border-t border-dashed border-slate-100 w-full"></div>
                      <div className="border-t border-dashed border-slate-100 w-full"></div>
                      <div className="border-t border-dashed border-slate-100 w-full"></div>
                      <div className="border-t border-slate-200 w-full"></div>
                    </div>

                    {/* Bars */}
                    {(() => {
                      const sortedDepts = Object.entries(stats.byDept).sort((a, b) => b[1] - a[1]).slice(0, 5);
                      const maxCount = Math.max(...sortedDepts.map(d => d[1])) || 1;

                      const chartColors = [
                        'bg-blue-600',
                        'bg-red-500',
                        'bg-amber-500',
                        'bg-teal-500',
                        'bg-indigo-500'
                      ];

                      return sortedDepts.map(([dept, count], idx) => {
                        const heightPercent = (count / maxCount) * 100;
                        return (
                          <div key={dept} className="flex flex-col items-center justify-end h-full w-full z-10 group cursor-pointer relative">
                            {/* Hover Full Name Tooltip */}
                            <div className="absolute -top-6 bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-30">
                              {dept}
                            </div>

                            {/* Permanent Value Badge */}
                            <div className="mb-2 text-slate-700 text-xs font-bold transition-transform duration-300 group-hover:-translate-y-1">
                              {count}
                            </div>

                            {/* Bar Container / Track */}
                            <div className="relative w-full max-w-[36px] sm:max-w-[48px] h-[120px] bg-slate-50 rounded-t-xl overflow-hidden border border-slate-100 border-b-0">
                              <div
                                className={`absolute bottom-0 left-0 w-full ${chartColors[idx % chartColors.length]} rounded-t-xl shadow-inner transition-all duration-700 ease-out group-hover:brightness-110`}
                                style={{ height: `${Math.max(heightPercent, 8)}%` }}
                              ></div>
                            </div>

                            {/* Label */}
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block truncate w-full max-w-[60px] text-center mt-3 h-4">
                              {dept}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Tickets by Priority */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Tickets by Priority</h3>
              <div className="space-y-4">
                <ProgressBar label="High Priority" value={stats.highPriority} total={stats.total} color="bg-red-500" />
                <ProgressBar label="Medium Priority" value={stats.mediumPriority} total={stats.total} color="bg-purple-500" />
                <ProgressBar label="Low Priority" value={stats.lowPriority} total={stats.total} color="bg-slate-500" />
              </div>
            </div>

          </div>

          {/* Right Column: Recent Activity */}
          <div className="relative h-full">
            <div className="absolute inset-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">

              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Tickets</h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                {recentTickets.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => onTicketSelect(ticket)}
                        className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col gap-3"
                      >
                        {/* Top Line: Reporter & Priority */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                            {ticket.reporter || 'Unknown'}
                          </span>
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">
                            {ticket.reporterDept || 'Unknown Dept'}
                          </span>
                          <div className="ml-auto">
                            <PriorityBadge priority={ticket.priority} />
                          </div>
                        </div>

                        {/* Middle: Title & Desc */}
                        <div>
                          <p className="text-[15px] font-bold text-slate-700 leading-tight">{ticket.title}</p>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{ticket.description}</p>
                        </div>

                        {/* Bottom Line: Code, Status, Date */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-slate-400">
                            #{ticket.code || ticket.id}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-500' :
                                ticket.status === 'IN_PROGRESS' ? 'bg-orange-500' :
                                  ticket.status === 'PENDING' ? 'bg-yellow-500' :
                                    ticket.status === 'REJECTED' || ticket.status === 'RE-OPENED' ? 'bg-red-500' :
                                      ticket.status === 'CLOSED' ? 'bg-slate-500' :
                                        ticket.status === 'CANCELLED' ? 'bg-zinc-400' :
                                          'bg-green-500'
                              }`}></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                              {ticket.status?.replace('_', ' ')}
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-400 font-medium">
                            {ticket.status === 'RESOLVED' && ticket.resolvedAt ?
                              new Date(ticket.resolvedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) :
                              ticket.status === 'IN_PROGRESS' && ticket.inProgressAt ?
                                new Date(ticket.inProgressAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) :
                                ticket.status === 'CANCELLED' && ticket.cancelledAt ?
                                  new Date(ticket.cancelledAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) :
                                  ticket.createdAt ?
                                    new Date(ticket.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No recent tickets found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, count, color, border, text, subtitle }) {
  return (
    <div className={`rounded-xl p-6 ${color} ${border ? `border ${border}` : ''} shadow-sm flex flex-col justify-between`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${text} opacity-80`}>{title}</p>
      <div>
        <p className={`text-4xl font-black mt-4 ${text}`}>{count}</p>
        {subtitle && <p className={`text-xs font-medium mt-1 opacity-75 ${text}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
}
