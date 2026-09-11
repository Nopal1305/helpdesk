import { useMemo, useState, useEffect } from 'react';
import PriorityBadge from './PriorityBadge';

export default function DashboardOverview({ tickets, user, userRole, onTicketSelect, onCreateClick }) {
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'RE-OPENED').length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
    const completed = tickets.filter(t => t.status === 'CLOSED').length;

    const highPriority = tickets.filter(t => t.priority === 'HIGH').length;
    const mediumPriority = tickets.filter(t => t.priority === 'MEDIUM').length;
    const lowPriority = tickets.filter(t => t.priority === 'LOW').length;

    // Dept breakdown
    const byDept = tickets.reduce((acc, t) => {
      const dept = t.reporterDept || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return { total, open, inProgress, resolved, completed, highPriority, mediumPriority, lowPriority, byDept };
  }, [tickets]);

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
        <StatCard title="Open Tickets" count={stats.open} color="bg-blue-100" border="border-blue-200" text="text-blue-800" />
        <StatCard title="In Progress" count={stats.inProgress} color="bg-orange-50" border="border-orange-200" text="text-orange-600" />
        <StatCard title="Resolved" count={stats.resolved} color="bg-green-50" border="border-green-200" text="text-green-700" />
        <StatCard title="Completed" count={stats.completed} color="bg-slate-100" border="border-slate-300" text="text-slate-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column: Charts / Breakdowns */}
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Tickets by Priority</h3>
            <div className="space-y-4">
              <ProgressBar label="High Priority" value={stats.highPriority} total={stats.total} color="bg-red-500" />
              <ProgressBar label="Medium Priority" value={stats.mediumPriority} total={stats.total} color="bg-purple-500" />
              <ProgressBar label="Low Priority" value={stats.lowPriority} total={stats.total} color="bg-slate-500" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Tickets by Department</h3>
            <ul className="space-y-3">
              {Object.entries(stats.byDept).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([dept, count]) => (
                <li key={dept} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 truncate pr-4">{dept}</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-xs">{count}</span>
                </li>
              ))}
              {Object.keys(stats.byDept).length === 0 && (
                <li className="text-sm text-slate-500">No data available</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="col-span-1 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Tickets</h3>
            </div>
            
            {recentTickets.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentTickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    onClick={() => onTicketSelect(ticket)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-400">#{ticket.code || ticket.id}</p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">{ticket.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                      {(userRole === 'superadmin' || userRole === 'it_staff') && (
                        <p className="text-xs text-slate-400 mt-1">
                          By: <span className="font-semibold">{ticket.reporter || 'Unknown'}</span> ({ticket.reporterDept || 'Unknown Dept'})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-medium text-slate-400 mr-2">
                        {ticket.status === 'RESOLVED' && ticket.resolvedAt ? 
                          new Date(ticket.resolvedAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) :
                         ticket.status === 'IN_PROGRESS' && ticket.inProgressAt ? 
                          new Date(ticket.inProgressAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) :
                         ticket.createdAt ? 
                          new Date(ticket.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
                        }
                      </span>
                      <PriorityBadge priority={ticket.priority} />
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        ticket.status === 'RE-OPENED' ? 'bg-red-50 text-red-700 border-red-200' :
                        ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {ticket.status?.replace('_', ' ')}
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
  );
}

function StatCard({ title, count, color, border, text }) {
  return (
    <div className={`rounded-xl p-6 ${color} ${border ? `border ${border}` : ''} shadow-sm flex flex-col justify-between`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${text} opacity-80`}>{title}</p>
      <p className={`text-4xl font-black mt-4 ${text}`}>{count}</p>
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
