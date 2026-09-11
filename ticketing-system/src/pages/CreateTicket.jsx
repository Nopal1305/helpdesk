import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
      setError(err.response?.data?.message || err.message || 'Failed to create ticket. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      {/* Top Navbar - consistent with Dashboard */}
      <nav className="relative flex h-14 shrink-0 items-center justify-between bg-[#263B56] px-6 text-white border-b border-[#1E293B]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/skk-migas-logo.png" alt="SKK Migas" className="h-10 w-auto object-contain" />
            <img src="/petrochina-logo.png" alt="PetroChina" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Centered App Name */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="text-base font-semibold tracking-wide text-white">SI-PETRO JABUNG</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Cancel
          </button>
        </div>
      </nav>

      <main className="mx-auto mt-10 max-w-3xl px-4 pb-12">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            &larr; Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Create New Ticket</h2>
          <p className="mt-1 text-sm text-slate-500">Please fill in the details of your operational issue or request below.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
          
          <TicketForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </main>
    </div>
  );
}