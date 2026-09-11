import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../lib/apiServices';
import Swal from 'sweetalert2';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await userApi.getDetails(id);
        setData(response.data || response);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        Swal.fire('Error', 'Failed to load user details.', 'error').then(() => {
          navigate(-1);
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-slate-500">Loading profile data...</div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">User data not found.</div>
      </div>
    );
  }

  const { user, stats, tickets } = data;
  const userRole = user?.role?.toLowerCase() || '';
  const isEmployee = userRole === 'employee';
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';

  const renderCards = () => {
    if (isSuperAdmin) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Tickets Assigned</h3>
            <p className="text-3xl font-bold text-slate-800">{stats.totalAssigned || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total System Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
          </div>
        </div>
      );
    } else if (isEmployee) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-slate-800">{stats.total || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Active</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.active || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Average Rating</h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-yellow-500">★</span>
              <p className="text-3xl font-bold text-slate-800">{stats.averageRating || 0}</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Completed Tickets</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Re-opened</h3>
            <p className="text-3xl font-bold text-red-600">{stats.reopened || 0}</p>
          </div>
        </div>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">OPEN</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">IN PROGRESS</span>;
      case 'RESOLVED': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">RESOLVED</span>;
      case 'CLOSED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">CLOSED</span>;
      case 'RE-OPENED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">RE-OPENED</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard', { state: { view: 'users' } })}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        {/* Combined Profile & Stats Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col lg:flex-row items-center lg:items-center gap-8">
          
          {/* Left: Profile Info */}
          <div className="flex flex-col gap-4 lg:w-1/3 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{user.full_name}</h1>
              <p className="text-slate-500">{user.email}</p>
            </div>
              
            <div className="flex flex-col gap-2">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 self-start">
                Role: {user.role}
              </span>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800 self-start">
                {isSuperAdmin ? 'Department: IT Management' : isEmployee ? `Department: ${user.department || '-'}` : `Specialization: ${user.specialization || '-'}`}
              </span>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="flex-1 w-full border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
            {renderCards()}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">
              {isSuperAdmin ? 'Task Assignment History' : isEmployee ? 'Report History' : 'Ticket Handling History'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold text-slate-700">Ticket Code</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-slate-700">Title</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-slate-700">Date</th>
                  {isSuperAdmin ? (
                    <th scope="col" className="px-6 py-3 font-semibold text-slate-700">Assigned Technician</th>
                  ) : null}
                  <th scope="col" className="px-6 py-3 font-semibold text-slate-700">Status</th>
                  {!isSuperAdmin ? (
                    <th scope="col" className="px-6 py-3 font-semibold text-slate-700">Rating & Review</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {tickets && tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-blue-600">
                        {ticket.ticket_code}
                      </td>
                      <td className="px-6 py-4 text-slate-800">
                        {ticket.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      {isSuperAdmin ? (
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {ticket.assignee_name || '-'}
                        </td>
                      ) : null}
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      {!isSuperAdmin ? (
                        <td className="px-6 py-4 text-slate-600">
                          {ticket.rating ? (
                            <div>
                              <div className="flex items-center text-yellow-500 mb-1">
                                {'★'.repeat(ticket.rating)}{'☆'.repeat(5 - ticket.rating)}
                              </div>
                              {ticket.feedback_note && (
                                <p className="text-xs text-slate-500 italic">"{ticket.feedback_note}"</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No ticket history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
