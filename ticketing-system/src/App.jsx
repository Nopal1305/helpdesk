import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { authApi, ticketApi } from './lib/apiServices';
import { authStorage } from './lib/authStorage';
import CreateTicket from './pages/CreateTicket';
import Dasboard from './pages/Dasboard';
import Login from './pages/Login';
import Register from './pages/Register';

const normalizeRole = (role) => {
  if (!role) return null;
  const normalizedRole = role.toLowerCase().replace(/[-\s]/g, '_');
  return normalizedRole === 'it_staff' ? 'it_staff' : 'employee';
};

const normalizeTickets = (payload) => {
  const raw = payload?.data?.tickets ?? payload?.tickets ?? payload?.ticket ?? payload;
  const arr = Array.isArray(raw) ? raw : (raw?.id ? [raw] : []);
  

  return arr.map((t) => {
    const safePriority = String(t.priority ?? t.prioritas ?? 'MEDIUM').toUpperCase();
    const safeStatus = String(t.status ?? t.ticket_status ?? 'OPEN').toUpperCase();

    return {
      ...t,
      code: t.code ?? t.ticket_code ?? t.id,
      id: t.id ?? t.ticket_id ?? t.ticket_code,
      department: t.department ?? t.category ?? 'Other',
      priority: safePriority,
      status: safeStatus,
      summary: t.summary ?? t.description?.slice(0, 90) ?? 'No description provided.',
      assignee: t.assignee_name ?? 'Unassigned',
      reporter: t.reporter_name ?? 'Employee',
      reporterDept: t.reporter_department || 'Unknown Dept',
      statusHistory: t.status_history ?? t.history ?? [],
      resolutionNote: t.resolution_notes || null,
      due: t.due ?? 'Not set',
    };
  });
};

function ProtectedRoute({ userRole, children }) {
  return userRole ? children : <Navigate to="/login" replace />;
}

function EmployeeRoute({ userRole, children }) {
  return userRole === 'employee' ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes({ userRole, user, tickets, isLoading, onLogin, onCreateTicket, onStatusChange, onLogout, handleLogout }) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute userRole={userRole}>
            <Dasboard
              tickets={tickets}
              userRole={userRole}
              user={user}
              isLoading={isLoading}
              onStatusChange={onStatusChange}
              onLogout={onLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-ticket"
        element={
          <EmployeeRoute userRole={userRole}>
            <CreateTicket
              onSubmit={onCreateTicket}
              onCancel={() => navigate('/dashboard')}
              userRole={userRole}
              onLogout={handleLogout}
            />
          </EmployeeRoute>
        }
      />
      <Route path="*" element={<Navigate to={userRole ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(() => authStorage.getUser());
  const [userRole, setUserRole] = useState(() => normalizeRole(authStorage.getUser()?.role));
  const [isLoading, setIsLoading] = useState(() => Boolean(authStorage.getUser()));

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setUserRole(null);
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    if (!userRole) return;

    ticketApi.list()
      .then((data) => setTickets(normalizeTickets(data)))
      .catch(() => setTickets([]))
      .finally(() => setIsLoading(false));
  }, [userRole]);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const { user } = await authApi.login(credentials);
      const role = normalizeRole(user?.role || user?.roleName);
      if (!role) throw new Error('Login response does not include a user role');
      setUser(user);
      setUserRole(role);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const handleCreateTicket = ({ title, category, priority, description }) => {
    return ticketApi.create({ title, category, priority, description })
      .then((data) => {
        console.log('Create ticket response:', data);
        try {
          const normalized = normalizeTickets(data);
          console.log('Normalized:', normalized);
          if (normalized && normalized.length > 0) {
            setTickets((current) => [normalized[0], ...current]);
          } else {
            // Fallback: construct ticket manually from response
            const ticket = data?.data?.ticket ?? data?.ticket ?? data?.data ?? data;
            if (ticket?.id || ticket?.ticket_id || ticket?.ticket_code) {
              const fallback = normalizeTickets([ticket])[0];
              if (fallback) {
                setTickets((current) => [fallback, ...current]);
              }
            }
          }
          return data;
        } catch (normError) {
          console.error('Normalize ticket failed:', normError);
          throw normError;
        }
      })
      .catch((error) => {
        console.error('Create ticket failed:', error);
        throw error;
      });
  };

  const handleStatusChange = async (status, ticketId, resolutionNote = null) => {
    if (userRole !== 'it_staff') return;
    if (ticketId === undefined || ticketId === null) {
      throw new Error('Ticket ID is missing');
    }

    console.log('handleStatusChange called:', { status, ticketId, resolutionNote });

    const previousTickets = tickets;

    // Optimistic update - instant UI feedback
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket
      )
    );

    try {
      const responseData = await ticketApi.updateStatus(ticketId, status, resolutionNote);
      console.log('Update status response:', responseData);
      const updatedTicket = normalizeTickets(responseData)[0];
      console.log('Normalized updated ticket:', updatedTicket);

      if (updatedTicket) {
        // Replace with server-confirmed data
        setTickets((current) =>
          current.map((ticket) =>
            ticket.id === ticketId ? updatedTicket : ticket
          )
        );
      } else {
        console.warn('Updated ticket is null/undefined after normalize');
      }
    } catch (error) {
      console.error('Update status failed:', error);
      // Rollback on error
      setTickets(previousTickets);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setUserRole(null);
    }
  };

  return (
    <AppRoutes
      userRole={userRole}
      user={user}
      tickets={tickets}
      isLoading={isLoading}
      onLogin={handleLogin}
      onCreateTicket={handleCreateTicket}
      onStatusChange={handleStatusChange}
      onLogout={handleLogout}
      handleLogout={handleLogout}
    />
  );
}

export default App;