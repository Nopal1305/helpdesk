import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '../tickets/DashboardLayouts';
import TicketForm from '../tickets/TicketForm';

export default function CreateTicket({ onSubmit, userRole, onLogout }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (ticketData) => {
    setError('');
    try {
      await onSubmit(ticketData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal membuat ticket. Coba lagi.');
    }
  };

  return (
    <DashboardLayout
      title="New ticket"
      userRole={userRole}
      onLogout={onLogout}
    >
      <div className="space-y-6 max-w-2xl">
        {error && <p className="text-sm font-bold text-alert">{error}</p>}
        <TicketForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </DashboardLayout>
  );
}
