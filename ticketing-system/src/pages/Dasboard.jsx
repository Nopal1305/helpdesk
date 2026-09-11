import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import TicketDetail from '../tickets/TicketDetail';
import TicketForm from '../tickets/TicketForm';
import DashboardOverview from '../tickets/DashboardOverview';
import ReportsView from '../tickets/ReportsView';
import SettingsView from './SettingsView';
import UserManagementView from './UserManagementView';
import { DEPARTMENTS, CATEGORY } from '../lib/constants';
import PriorityBadge from '../tickets/PriorityBadge';

export default function Dasboard({ tickets, userRole, user, isLoading, onStatusChange, onAssignTicket, onClaimTicket, onDeleteTicket, onCreateTicket, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [activeFilter, setActiveFilter] = useState(userRole === 'it_staff' ? 'IN_PROGRESS' : 'OPEN');
  const [inProgressSubFilter, setInProgressSubFilter] = useState('ALL');
  const [activeDept, setActiveDept] = useState('All');
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [employeeViewMode, setEmployeeViewMode] = useState('My Tickets');
  const [itStaffViewMode, setItStaffViewMode] = useState('My Tasks');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.view) {
      setSelectedView(location.state.view);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const scopedTickets = useMemo(() => {
    let result = tickets;
    if (userRole === 'it_staff') {
      if (itStaffViewMode === 'My Tasks') {
        result = tickets.filter(t => String(t.assignee_id) === String(user?.id));
      }
    } else if (userRole === 'employee') {
      if (employeeViewMode === 'My Tickets') {
        result = tickets.filter(t => String(t.reporter_id) === String(user?.id));
      }
    }
    
    if (userRole === 'superadmin') {
      if (activeDept !== 'All') {
        result = result.filter(t => String(t.reporterDept).toUpperCase() === activeDept);
      }
      if (activeCategory !== 'All') {
        result = result.filter(t => String(t.category).toUpperCase() === activeCategory.toUpperCase());
      }
    }
    
    return result;
  }, [tickets, user, userRole, employeeViewMode, itStaffViewMode, activeDept, activeCategory]);

  const handleCreateSubmit = async (ticketData) => {
    setCreateError('');
    try {
      await onCreateTicket(ticketData);
      setActiveFilter('OPEN');
      setSelectedView('dashboard');
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create ticket. Please try again.');
    }
  };

  const selectedTicket = useMemo(
    () => scopedTickets.find((ticket) => ticket.id === selectedTicketId) ?? scopedTickets[0],
    [scopedTickets, selectedTicketId]
  );

  const filteredTickets = useMemo(() => {
    return scopedTickets.filter((ticket) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'IN_PROGRESS') {
        if (inProgressSubFilter === 'RE_OPENED') return ticket.status === 'RE-OPENED';
        if (inProgressSubFilter === 'IN_PROGRESS_ONLY') return ticket.status === 'IN_PROGRESS';
        return ticket.status === 'IN_PROGRESS' || ticket.status === 'RE-OPENED';
      }
      if (activeFilter === 'CLOSED') return ticket.status === 'CLOSED';
      return ticket.status === activeFilter;
    });
  }, [activeFilter, inProgressSubFilter, scopedTickets]);

  const countTickets = (status) => {
    return scopedTickets.filter(ticket => {
      if (status === 'IN_PROGRESS') return ticket.status === 'IN_PROGRESS' || ticket.status === 'RE-OPENED';
      if (status === 'CLOSED') return ticket.status === 'CLOSED';
      return ticket.status === status;
    }).length;
  };

  const handleOpenTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setSelectedView('detail');
  };

  return (
    <div className="flex h-screen w-full flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <nav className="relative flex h-16 shrink-0 items-center justify-between bg-[#263B56] px-4 sm:px-6 text-white border-b border-[#1E293B] z-40">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center rounded-md p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          {/* Logos (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <img src="/skk-migas-logo.png" alt="SKK Migas" className="h-8 sm:h-10 w-auto object-contain" />
            <img src="/petrochina-logo.png" alt="PetroChina" className="h-8 sm:h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Centered App Name */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <abbr title="Sistem Informasi Pelaporan Elektronik dan Tiket Resolusi Operasional IT PetroChina Jabung" className="text-base font-semibold tracking-wide text-white cursor-help decoration-dashed underline underline-offset-4 decoration-white/50 hover:decoration-white transition-colors">SI-PETRO JABUNG</abbr>
        </div>
        
        <div className="flex items-center gap-4 relative">
          {/* Profile */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-medium text-white">{user?.fullname || 'User'}</span>
              <span className="text-[10px] text-slate-300 capitalize">{userRole === 'superadmin' ? 'Superadmin' : userRole.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-orange-400 overflow-hidden ring-2 ring-transparent group-hover:ring-orange-300 transition-all">
                <img src={`https://ui-avatars.com/api/?name=${user?.fullname || 'User'}&background=F97316&color=fff`} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 opacity-70">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              {/* Overlay for clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 sm:hidden bg-slate-50">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullname || 'User'}</p>
                  <p className="text-xs text-slate-500 capitalize truncate">{userRole === 'superadmin' ? 'Superadmin' : userRole.replace('_', ' ')}</p>
                </div>
                
                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                    onClick={() => {
                      setSelectedView('settings');
                      setIsProfileOpen(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-400">
                      <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
                    </svg>
                    Account Settings
                  </button>
                </div>
                
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.048a.75.75 0 10-1.06-1.06l-2.323 2.323a.25.25 0 000 .354l2.323 2.323a.75.75 0 101.06-1.06l-1.048-1.048h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-[#f8fafc] relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between md:justify-center border-b border-slate-200 px-4 md:px-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-700">Help Desk</h1>
          <button 
            className="md:hidden flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm bg-slate-100 px-3 py-1.5 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-3 py-4">
          <div className="space-y-1">
            <SidebarItem 
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>}
              label="Overview" 
              count="" 
              active={selectedView === 'overview'} 
              onClick={() => {
                setSelectedView('overview');
                setIsMobileMenuOpen(false);
              }} 
            />
          </div>
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Default Views</p>
            <div className="space-y-1">
              {!(userRole === 'it_staff' && itStaffViewMode === 'My Tasks') && (
                <SidebarItem 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>}
                  label="All Open" count={countTickets('OPEN')} active={selectedView === 'dashboard' && activeFilter === 'OPEN'} 
                  onClick={() => {
                    setActiveFilter('OPEN'); 
                    setSelectedView('dashboard');
                    setIsMobileMenuOpen(false);
                  }} 
                  activeColor="blue"
                />
              )}
              <SidebarItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                label="In Progress" count={countTickets('IN_PROGRESS')} active={selectedView === 'dashboard' && activeFilter === 'IN_PROGRESS'} 
                onClick={() => {
                  setActiveFilter('IN_PROGRESS'); 
                  setSelectedView('dashboard');
                  setIsMobileMenuOpen(false);
                }} 
                activeColor="orange"
              />
              <SidebarItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                label="Resolved" count={countTickets('RESOLVED')} active={selectedView === 'dashboard' && activeFilter === 'RESOLVED'} 
                onClick={() => {
                  setActiveFilter('RESOLVED'); 
                  setSelectedView('dashboard');
                  setIsMobileMenuOpen(false);
                }} 
                activeColor="green"
              />
              <SidebarItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                label="Completed" count={countTickets('CLOSED')} active={selectedView === 'dashboard' && activeFilter === 'CLOSED'} 
                onClick={() => {
                  setActiveFilter('CLOSED'); 
                  setSelectedView('dashboard');
                  setIsMobileMenuOpen(false);
                }} 
                activeColor="slate"
              />
            </div>
          </div>

          {userRole === 'employee' && (
            <div className="mt-4">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">View Mode</p>
              <div className="px-3">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => {
                      setEmployeeViewMode('My Tickets');
                      setSelectedView(activeFilter === 'ALL' ? 'overview' : 'dashboard');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      employeeViewMode === 'My Tickets' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    My Tickets
                  </button>
                  <button 
                    onClick={() => {
                      setEmployeeViewMode('My Division Tickets');
                      setSelectedView(activeFilter === 'ALL' ? 'overview' : 'dashboard');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      employeeViewMode === 'My Division Tickets' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    My Division
                  </button>
                </div>
              </div>
            </div>
          )}

          {userRole === 'it_staff' && (
            <div className="mt-4">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">View Mode</p>
              <div className="px-3">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => {
                      setItStaffViewMode('My Tasks');
                      if (activeFilter === 'OPEN') {
                        setActiveFilter('IN_PROGRESS');
                      }
                      setSelectedView(activeFilter === 'ALL' ? 'overview' : 'dashboard');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      itStaffViewMode === 'My Tasks' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    My Tasks
                  </button>
                  <button 
                    onClick={() => {
                      setItStaffViewMode('All Tickets');
                      setSelectedView(activeFilter === 'ALL' ? 'overview' : 'dashboard');
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      itStaffViewMode === 'All Tickets' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    All Tickets
                  </button>
                </div>
              </div>
            </div>
          )}

          {userRole === 'superadmin' && (
            <div>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Departments</p>
              <div className="mb-4 mx-1 relative">
                <button 
                  onClick={() => setIsDeptOpen(!isDeptOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                    <span className="truncate">{activeDept === 'All' ? 'All Departments' : activeDept}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-400 transition-transform ${isDeptOpen ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
                {isDeptOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-full flex flex-col rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto z-10">
                    <button 
                      onClick={() => { setActiveDept('All'); setIsDeptOpen(false); }}
                      className={`px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeDept === 'All' ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      All Departments
                    </button>
                    {DEPARTMENTS.map((dept) => (
                      <button 
                        key={dept}
                        onClick={() => { setActiveDept(dept); setIsDeptOpen(false); }}
                        className={`px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeDept === dept ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4 mx-1 relative">
                <button 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>
                    <span className="truncate">{activeCategory === 'All' ? 'All Categories' : CATEGORY[activeCategory]?.label || activeCategory}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
                {isCategoryOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-full flex flex-col rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto z-10">
                    <button 
                      onClick={() => { setActiveCategory('All'); setIsCategoryOpen(false); }}
                      className={`px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeCategory === 'All' ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      All Categories
                    </button>
                    {Object.keys(CATEGORY).map((catKey) => (
                      <button 
                        key={catKey}
                        onClick={() => { setActiveCategory(catKey); setIsCategoryOpen(false); }}
                        className={`px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeCategory === catKey ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        {CATEGORY[catKey].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Admin Tools</p>
              <div className="space-y-1">
                <SidebarItem 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}
                  label="Reports" count="" active={selectedView === 'reports'} 
                  onClick={() => {
                    setSelectedView('reports');
                    setIsMobileMenuOpen(false);
                  }} 
                />
                <SidebarItem 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
                  label="User Management" count="" active={selectedView === 'users'} 
                  onClick={() => {
                    setSelectedView('users');
                    setIsMobileMenuOpen(false);
                  }} 
                />
              </div>
            </div>
          )}
        </div>

          <div className="mt-auto border-t border-slate-200 p-4 space-y-4">
            {userRole === 'employee' && (
              <button onClick={() => {
                setSelectedView('create');
                setIsMobileMenuOpen(false);
              }} className="w-full rounded-md bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                Create ticket
              </button>
            )}
            <div className="flex justify-center items-center gap-4 md:hidden">
              <img src="/skk-migas-logo.png" alt="SKK Migas" className="h-8 w-auto object-contain" />
              <img src="/petrochina-logo.png" alt="PetroChina" className="h-8 w-auto object-contain" />
            </div>
          </div>
        </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8fafc]">
        {selectedView === 'overview' ? (
          <div key="overview" className="flex-1 overflow-y-auto p-8">
            <DashboardOverview 
              tickets={scopedTickets} 
              user={user} 
              userRole={userRole}
              onCreateClick={() => setSelectedView('create')}
              onTicketSelect={(ticket) => { 
                setSelectedTicketId(ticket.id); 
                setSelectedView('detail'); 
              }} 
            />
          </div>
        ) : selectedView === 'dashboard' ? (
          <>
            <header className="flex flex-col sm:flex-row shrink-0 sm:items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8 gap-4 sm:gap-0">
              <div className="flex items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold capitalize text-slate-800">{activeFilter.replace('_', ' ').toLowerCase()} Tickets</h2>
                <span className="rounded-full bg-slate-100 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-slate-600">{filteredTickets.length} issues</span>
              </div>
              
              {activeFilter === 'IN_PROGRESS' && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
                  <button 
                    onClick={() => setInProgressSubFilter('ALL')}
                    className={`whitespace-nowrap flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${inProgressSubFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setInProgressSubFilter('IN_PROGRESS_ONLY')}
                    className={`whitespace-nowrap flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${inProgressSubFilter === 'IN_PROGRESS_ONLY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => setInProgressSubFilter('RE_OPENED')}
                    className={`whitespace-nowrap flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${inProgressSubFilter === 'RE_OPENED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Re-opened
                    {countTickets('RE-OPENED') > 0 && (
                      <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                        {countTickets('RE-OPENED')}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </header>
            
            <div key={`dashboard-${activeFilter}`} className="flex-1 overflow-y-auto p-4 sm:p-8">
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading tickets...</p>
              ) : filteredTickets.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  {filteredTickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      onClick={() => handleOpenTicket(ticket.id)}
                      className="flex flex-col sm:flex-row cursor-pointer sm:items-center justify-between border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 last:border-0 gap-3 sm:gap-0"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{ticket.reporter}</span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{ticket.reporterDept}</span>
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                        <p className="truncate text-sm font-medium text-slate-700">{ticket.title}</p>
                        <p className="truncate text-xs text-slate-500">{ticket.summary || ticket.description}</p>
                      </div>
                      
                      <div className="flex sm:shrink-0 flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        <span className="text-xs font-semibold text-slate-400">#{ticket.code || ticket.id}</span>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-1.5 sm:mt-1">
                          <div className="flex items-center gap-1.5">
                            <StatusDot status={ticket.status} />
                            <span className={`text-[10px] font-bold uppercase ${ticket.status === 'RE-OPENED' ? 'text-red-500' : 'text-slate-400'}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 hidden sm:block">
                            {(ticket.updatedAt || ticket.createdAt) 
                              ? new Date(ticket.updatedAt || ticket.createdAt).toLocaleString('en-US', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })
                              : '-'}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 sm:hidden block">
                          {(ticket.updatedAt || ticket.createdAt) 
                            ? new Date(ticket.updatedAt || ticket.createdAt).toLocaleString('en-US', {
                                day: '2-digit', month: 'short', year: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-sm text-slate-500">No tickets found in this view.</p>
                </div>
              )}
            </div>
          </>
        ) : selectedView === 'create' ? (
          <>
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Create Ticket</h2>
            </header>
            <div key="create" className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                  <p className="text-sm text-slate-500">Please fill out the details of your issue or request below.</p>
                </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                {createError && (
                  <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {createError}
                  </div>
                )}
                
                {selectedView === 'create' && (
                  <TicketForm
                    onSubmit={handleCreateSubmit}
                    onCancel={() => setSelectedView('dashboard')}
                  />
                )}
              </div>
            </div>
          </div>
          </>
        ) : selectedView === 'settings' ? (
          <div key="settings" className="flex-1 overflow-y-auto bg-slate-50">
            <SettingsView user={user} onUpdateUser={onUpdateUser} />
          </div>
        ) : selectedView === 'reports' ? (
          <div key="reports" className="flex-1 overflow-y-auto p-4 sm:p-8">
            <ReportsView tickets={scopedTickets} />
          </div>
        ) : selectedView === 'users' ? (
          <div key="users" className="flex-1 overflow-y-auto bg-slate-50">
            <UserManagementView user={user} />
          </div>
        ) : (
          <div key={`detail-${selectedTicket?.id}`} className="flex-1 overflow-y-auto p-4 sm:p-8">
            <TicketDetail 
              ticket={selectedTicket} 
              onBack={() => {
                setSelectedView('dashboard');
              }}
              onStatusChange={async (status, note, img) => {
                await onStatusChange(status, selectedTicket.id, note, img);
                if (status === 'IN_PROGRESS' || status === 'RESOLVED') {
                  setTimeout(() => {
                    setActiveFilter(status);
                    setSelectedView('dashboard');
                  }, 1500);
                }
              }}
              onAssignTicket={async (assigneeId, assignmentNote) => {
                await onAssignTicket(selectedTicket.id, assigneeId, assignmentNote);
                setTimeout(() => {
                  setActiveFilter('IN_PROGRESS');
                  setSelectedView('dashboard');
                }, 1500);
              }}
              onClaimTicket={async (assignmentNote) => {
                await onClaimTicket(selectedTicket.id, assignmentNote);
                setTimeout(() => {
                  setActiveFilter('IN_PROGRESS');
                  setSelectedView('dashboard');
                }, 1500);
              }}
              onDeleteTicket={async () => {
                await onDeleteTicket(selectedTicket.id);
                setSelectedView('dashboard');
              }}
              userRole={userRole}
              currentUser={user}
            />
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, count, active, onClick, activeColor = 'blue' }) {
  const colorMap = {
    blue: {
      border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700'
    },
    green: {
      border: 'border-green-600', bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-700'
    },
    orange: {
      border: 'border-orange-600', bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700'
    },
    slate: {
      border: 'border-slate-500', bg: 'bg-slate-50', text: 'text-slate-700', icon: 'text-slate-500', badgeBg: 'bg-slate-200', badgeText: 'text-slate-700'
    }
  };
  const activeClass = colorMap[activeColor] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-r-lg rounded-l-sm border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active 
          ? `${activeClass.border} ${activeClass.bg} ${activeClass.text}` 
          : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`${active ? activeClass.icon : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
          {icon}
        </div>
        <span className="tracking-wide">{label}</span>
      </div>
      {count !== "" && (
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${active ? `${activeClass.badgeBg} ${activeClass.badgeText}` : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatusDot({ status }) {
  const colors = {
    OPEN: 'bg-blue-600',
    IN_PROGRESS: 'bg-orange-500',
    'RE-OPENED': 'bg-red-500',
    RESOLVED: 'bg-green-600',
    CLOSED: 'bg-slate-600',
  };
  return <div className={`h-2.5 w-2.5 rounded-full ${colors[status] || 'bg-slate-300'}`} title={`Status: ${status}`} />;
}