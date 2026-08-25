import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../tickets/Card';
import DashboardLayout from '../tickets/DashboardLayouts';
import FilterBar from '../tickets/FilterBar';
import StatsPanel from '../tickets/StatsPanel';
import TicketDetail from '../tickets/TicketDetail';

export default function Dasboard({ tickets, userRole, user, isLoading, onStatusChange, onLogout }) {
  const navigate = useNavigate();
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('Open');

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0],
    [tickets, selectedTicketId],
  );

  const filteredTickets = useMemo(() => {
    const statusByFilter = {
      Open: 'OPEN',
      'In Progress': 'IN_PROGRESS',
      Resolved: 'RESOLVED',
    };

    return tickets.filter((ticket) => ticket.status === statusByFilter[activeFilter]);
  }, [activeFilter, tickets]);

  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setSelectedView('detail');
  };

  return (
    <DashboardLayout
      title={selectedView === 'dashboard' ? 'Active issues' : 'Ticket detail'}
      actionLabel={userRole === 'employee' && selectedView !== 'detail' ? '+ New ticket' : undefined}
      onAction={() => navigate('/create-ticket')}
      userRole={userRole}
      user={user}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {selectedView === 'dashboard' && (
          <>
            <StatsPanel tickets={tickets} />
            <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">Loading tickets...</p>
              ) : filteredTickets.length ? filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  ticket={ticket}
                  selected={selectedTicketId === ticket.id}
                  onSelect={handleOpenTicket}
                />
              )) : (
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">No tickets found.</p>
              )}
            </section>
          </>
        )}

        {selectedView === 'detail' && (
          <TicketDetail
            ticket={selectedTicket}
            onBack={() => setSelectedView('dashboard')}
            onStatusChange={(status, note) => onStatusChange(status, selectedTicket.id, note)}
            userRole={userRole}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
