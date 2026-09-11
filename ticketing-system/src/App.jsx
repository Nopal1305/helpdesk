import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { authApi, ticketApi } from './lib/apiServices';
import { authStorage } from './lib/authStorage';
import Dasboard from './pages/Dasboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDetail from './pages/UserDetail';

const normalizeRole = (role) => {
  if (!role) return null;
  const normalizedRole = role.toLowerCase().replace(/[-\s]/g, '_');
  if (normalizedRole === 'it_staff') return 'it_staff';
  if (normalizedRole === 'admin' || normalizedRole === 'superadmin') return 'superadmin';
  return 'employee';
};

const normalizeTickets = (payload) => {
  const raw = payload?.data?.tickets ?? payload?.data?.ticket ?? payload?.tickets ?? payload?.ticket ?? payload;
  const arr = Array.isArray(raw) ? raw : (raw?.id ? [raw] : []);
  

  return arr.map((t) => {
    const safePriority = String(t.priority ?? t.prioritas ?? 'MEDIUM').toUpperCase();
    const safeStatus = String(t.status ?? t.ticket_status ?? 'OPEN').toUpperCase();

    const isValidDate = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d instanceof Date && !isNaN(d.getTime());
    };

    return {
      ...t,
      code: t.code ?? t.ticket_code ?? t.id,
      id: t.id ?? t.ticket_id ?? t.ticket_code,
      department: t.department ?? t.category ?? 'Other',
      priority: safePriority,
      status: safeStatus,
      summary: t.summary ?? t.description?.slice(0, 90) ?? 'No description provided.',
      assignee: t.assignee_name ?? 'Unassigned',
      assignee_specialization: t.assignee_specialization ?? null,
      reporter: t.reporter_name ?? 'Employee',
      reporterDept: t.reporter_department || 'Unknown Dept',
      statusHistory: t.status_history ?? t.history ?? [],
      resolutionNote: t.resolution_notes || null,
      resolutionImage: t.resolution_image || null,
      issueImage: t.issue_image || null,
      inProgressAt: isValidDate(t.in_progress_at) ? t.in_progress_at : null,
      reopenedAt: isValidDate(t.reopened_at) ? t.reopened_at : null,
      resolvedAt: isValidDate(t.resolved_at) ? t.resolved_at : null,
      closedAt: isValidDate(t.closed_at) ? t.closed_at : null,
      createdAt: isValidDate(t.created_at) ? t.created_at : isValidDate(t.createdAt) ? t.createdAt : null,
      updatedAt: isValidDate(t.updated_at) ? t.updated_at : isValidDate(t.updatedAt) ? t.updatedAt : null,
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

function AppRoutes({ userRole, user, tickets, isLoading, onLogin, onCreateTicket, onStatusChange, onAssignTicket, onClaimTicket, onDeleteTicket, onLogout, handleLogout, onUpdateUser }) {
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
              onAssignTicket={onAssignTicket}
              onClaimTicket={onClaimTicket}
              onDeleteTicket={onDeleteTicket}
              onCreateTicket={onCreateTicket}
              onLogout={onLogout}
              onUpdateUser={onUpdateUser}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute userRole={userRole}>
            <UserDetail />
          </ProtectedRoute>
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

    const fetchTickets = () => {
      ticketApi.list()
        .then((data) => setTickets(normalizeTickets(data)))
        .catch((err) => {
          console.error("Failed to fetch tickets:", err);
          // Only clear tickets on initial load failure to avoid flickering if one poll fails
          if (isLoading) setTickets([]);
        })
        .finally(() => setIsLoading(false));
    };

    fetchTickets();

    const intervalId = setInterval(fetchTickets, 5000);
    return () => clearInterval(intervalId);
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

  const handleCreateTicket = async (ticketData) => {
    const res = await ticketApi.create(ticketData);
    const data = await ticketApi.list();
    setTickets(normalizeTickets(data));
    return res;
  };

  const handleStatusChange = async (status, ticketId, resolutionNote = null, resolutionImage = null) => {
    if (userRole !== 'it_staff' && userRole !== 'superadmin') return;
    try {
      await ticketApi.updateStatus(ticketId, status, resolutionNote, resolutionImage);
      const data = await ticketApi.list();
      setTickets(normalizeTickets(data));
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      throw error;
    }
  };

  const handleAssignTicket = async (ticketId, assigneeId, assignmentNote) => {
    if (userRole !== 'superadmin' && userRole !== 'admin') return;
    try {
      await ticketApi.assign(ticketId, assigneeId, assignmentNote);
      const data = await ticketApi.list();
      setTickets(normalizeTickets(data));
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      throw error;
    }
  };

  const handleClaimTicket = async (ticketId, assignmentNote) => {
    if (userRole !== 'it_staff') return;
    try {
      await ticketApi.claim(ticketId, assignmentNote);
      const data = await ticketApi.list();
      setTickets(normalizeTickets(data));
    } catch (error) {
      console.error('Failed to claim ticket:', error);
      throw error;
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (userRole !== 'it_staff' && userRole !== 'superadmin') return;
    
    const previousTickets = tickets;
    setTickets((current) => current.filter((ticket) => ticket.id !== ticketId));

    try {
      await ticketApi.delete(ticketId);
    } catch (error) {
      console.error('Delete ticket failed:', error);
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

  const handleUpdateUser = (newFullName) => {
    if (!user) return;
    const updatedUser = { ...user, fullname: newFullName, full_name: newFullName };
    setUser(updatedUser);
    
    // Update storage
    const currentSession = {
      accessToken: authStorage.getAccessToken(),
      refreshToken: authStorage.getRefreshToken(),
      user: updatedUser
    };
    if (currentSession.accessToken) {
      authStorage.setSession(currentSession);
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
      onAssignTicket={handleAssignTicket}
      onClaimTicket={handleClaimTicket}
      onDeleteTicket={handleDeleteTicket}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    />
  );
}

export default App;