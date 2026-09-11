import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import PriorityBadge from './PriorityBadge';
import { userApi, ticketApi } from '../lib/apiServices';

export default function TicketDetail({ ticket, onBack, onStatusChange, onAssignTicket, onClaimTicket, onDeleteTicket, userRole = 'employee', currentUser }) {
  const [statusRequest, setStatusRequest] = useState(null);
  const [assignRequest, setAssignRequest] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [statusError, setStatusError] = useState('');
  const [note, setNote] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Attempt to scroll to top whenever the ticket changes
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
    
    if (userRole === 'superadmin') {
      userApi.list().then(response => {
        const techs = response?.data?.filter(u => String(u.role).toUpperCase() === 'IT_STAFF') || [];
        setTechnicians(techs);
      }).catch(err => console.error("Failed fetching technicians", err));
    }
  }, [ticket?.id, userRole]);

  if (!ticket) return null;

  const safeStatus = String(ticket.status ?? 'OPEN').toUpperCase();
  const isMyTask = String(ticket.assignee_id) === String(currentUser?.id);
  
  const getStatusStyle = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'RE-OPENED': return 'bg-red-50 text-red-700 border-red-200';
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleStatusChange = async (status) => {
    if (status === 'RESOLVED') {
      if (!note.trim()) {
        setStatusError('Resolution note is required to resolve the ticket!');
        return;
      }
    }
    
    setStatusRequest(status);
    setStatusError('');

    try {
      await onStatusChange?.(status, note, imageBase64);
      setNote('');
      setImageBase64('');
      setShowResolveForm(false);
      if (status === 'IN_PROGRESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Ticket has been claimed and is now In Progress.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else if (status === 'RESOLVED') {
        Swal.fire({
          title: 'Success!',
          text: 'Ticket successfully resolved.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      setStatusError(error.response?.data?.message || error.message || 'Status update failed.');
    } finally {
      setStatusRequest(null);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedTech) return;
    
    const { value: assignmentNote } = await Swal.fire({
      title: 'Catatan Penugasan',
      input: 'textarea',
      inputLabel: 'Masukkan catatan/instruksi untuk Teknisi dan Pelapor',
      inputPlaceholder: 'Tulis catatan di sini...',
      showCancelButton: true,
      confirmButtonText: 'Tugaskan',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-xl shadow-2xl border border-slate-200',
        title: 'text-xl font-bold text-slate-800',
        inputLabel: 'text-sm font-medium text-slate-600 text-left w-full mb-1',
        input: 'text-sm text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full min-h-[120px] p-3 mt-2',
        actions: 'mt-6 gap-3 w-full justify-end px-4',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors',
        cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-6 rounded-lg transition-colors'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Catatan penugasan wajib diisi!'
        }
      }
    });

    if (assignmentNote) {
      setAssignRequest(true);
      setStatusError('');
      try {
        await onAssignTicket?.(selectedTech, assignmentNote);
        Swal.fire({
          title: 'Success!',
          text: 'Ticket has been assigned successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        setStatusError(error.response?.data?.message || error.message || 'Failed to assign ticket.');
      } finally {
        setAssignRequest(false);
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    setFeedbackSubmitting(true);
    try {
      await ticketApi.submitFeedback(ticket.id, {
        action: 'CLOSED',
        rating: feedbackRating,
        feedback_note: feedbackNote
      });
      Swal.fire({
        title: 'Thank you!',
        text: 'Your feedback has been submitted and the ticket is now closed.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        // Trigger a re-fetch of tickets in the parent component
        onBack();
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to submit feedback',
        icon: 'error'
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleReopen = async () => {
    if (!feedbackNote.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please provide a comment explaining what issue persists.',
        icon: 'warning'
      });
      return;
    }

    setStatusRequest('IN_PROGRESS'); // Just for UI loading state re-use
    try {
      await ticketApi.submitFeedback(ticket.id, {
        action: 'RE-OPENED',
        rating: feedbackRating,
        feedback_note: feedbackNote
      });
      Swal.fire({
        title: 'Ticket Re-opened',
        text: 'The ticket has been marked as In Progress again.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        onBack();
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to re-open ticket',
        icon: 'error'
      });
    } finally {
      setStatusRequest(null);
    }
  };

  return (
    <div ref={containerRef} className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center p-2.5 -ml-2.5 min-h-[44px] text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>
        )}

        {userRole === 'superadmin' && onDeleteTicket && (
          <button
            type="button"
            onClick={() => {
              Swal.fire({
                title: 'Delete Ticket?',
                text: "This ticket will be permanently deleted!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, Delete!',
                cancelButtonText: 'Cancel'
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    await onDeleteTicket();
                    Swal.fire({
                      title: 'Deleted!',
                      text: 'Ticket has been deleted.',
                      icon: 'success',
                      timer: 1500,
                      showConfirmButton: false
                    });
                  } catch (error) {
                    Swal.fire({
                      title: 'Failed!',
                      text: error.response?.data?.message || error.message || 'An error occurred while deleting the ticket.',
                      icon: 'error'
                    });
                  }
                }
              });
            }}
            className="flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete Ticket
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
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
        <section className="flex h-fit flex-col gap-6">
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {ticket.description || 'No description provided.'}
          </p>
          </div>
          {ticket.issueImage && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Issue Attachment
              </h3>
              <img src={ticket.issueImage} alt="Issue Attachment" className="max-h-60 rounded-md border border-slate-200 object-cover shadow-sm" />
            </div>
          )}

          {ticket.assignment_note && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm mt-2">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-800">
                Catatan Penugasan / Instruksi
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-indigo-900 font-medium">
                {ticket.assignment_note}
              </p>
            </div>
          )}

          {ticket.resolutionNote && (
            <div className="mt-6 rounded-lg border border-green-100 bg-green-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-800">
                Resolution Note
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-900">
                &quot;{ticket.resolutionNote}&quot;
              </p>
              {ticket.resolutionImage && (
                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-800">
                    Resolution Attachment
                  </h3>
                  <img src={ticket.resolutionImage} alt="Resolution Attachment" className="max-h-60 rounded-md border border-green-200 object-cover shadow-sm" />
                </div>
              )}
            </div>
          )}

          {(safeStatus === 'CLOSED' || safeStatus === 'RE-OPENED') && (ticket.rating || ticket.feedback_note) && (
            <div className={`mt-6 rounded-lg border p-4 ${safeStatus === 'CLOSED' ? 'border-yellow-200 bg-yellow-50' : 'border-orange-200 bg-orange-50'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${safeStatus === 'CLOSED' ? 'text-yellow-800' : 'text-orange-800'}`}>
                User Feedback
              </h3>
              {ticket.rating && (
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${ticket.rating >= star ? (safeStatus === 'CLOSED' ? 'text-yellow-500' : 'text-orange-500') : (safeStatus === 'CLOSED' ? 'text-yellow-200' : 'text-orange-200')}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className={`ml-2 text-sm font-medium ${safeStatus === 'CLOSED' ? 'text-yellow-800' : 'text-orange-800'}`}>{ticket.rating} / 5</span>
                </div>
              )}
              {ticket.feedback_note && (
                <p className={`mt-2 text-sm italic ${safeStatus === 'CLOSED' ? 'text-yellow-900' : 'text-orange-900'}`}>
                  "{ticket.feedback_note}"
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6">
            {userRole === 'it_staff' && safeStatus === 'OPEN' && (
              (!currentUser?.specialization || 
               currentUser?.specialization?.toUpperCase() === String(ticket.department).toUpperCase() || 
               currentUser?.specialization?.toUpperCase() === String(ticket.category).toUpperCase() || 
               currentUser?.role === 'admin') ? (
                <button
                  type="button"
                  onClick={async () => {
                    const { value: assignmentNote } = await Swal.fire({
                      title: 'Catatan Penugasan',
                      input: 'textarea',
                      inputLabel: 'Masukkan catatan/instruksi tambahan (opsional)',
                      inputPlaceholder: 'Tulis catatan di sini...',
                      showCancelButton: true,
                      confirmButtonText: 'Klaim',
                      cancelButtonText: 'Batal'
                    });

                    if (assignmentNote !== undefined) {
                      setStatusRequest('IN_PROGRESS');
                      try {
                        await onClaimTicket?.(assignmentNote);
                      } catch (error) {
                        setStatusError(error.response?.data?.message || error.message || 'Failed to claim ticket.');
                        setStatusRequest(null);
                      }
                    }
                  }}
                  disabled={statusRequest !== null}
                  className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {statusRequest === 'IN_PROGRESS' ? 'Processing...' : 'Klaim Tiket'}
                </button>
              ) : (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-4 text-center">
                  <p className="text-sm font-medium text-orange-800">
                    Tiket ini di luar batas spesialisasi keahlian Anda.
                  </p>
                </div>
              )
            )}

            {userRole === 'it_staff' && safeStatus === 'IN_PROGRESS' && !isMyTask && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-center">
                <p className="text-sm font-medium text-blue-800">
                  Tiket ini sedang ditangani oleh teknisi terkait: <span className="font-bold">{ticket.assignee ? `${ticket.assignee}${ticket.assignee_specialization ? ` (${ticket.assignee_specialization})` : ''}` : 'Teknisi'}</span>
                </p>
              </div>
            )}

            {userRole === 'it_staff' && (safeStatus === 'IN_PROGRESS' || safeStatus === 'RE-OPENED') && isMyTask && !showResolveForm && (
              <button
                type="button"
                onClick={() => setShowResolveForm(true)}
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Write Resolution Note
              </button>
            )}

            {userRole === 'it_staff' && (safeStatus === 'IN_PROGRESS' || safeStatus === 'RE-OPENED') && isMyTask && showResolveForm && (
              <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">Resolution Form</h4>
                  <button 
                    type="button" 
                    onClick={() => setShowResolveForm(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Resolution Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Type the resolution steps taken..."
                    className="mt-1 block w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows="4"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Resolution Attachment (Optional)
                  </label>
                  <div className="flex flex-wrap items-start gap-3 mt-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 border border-transparent transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      Choose from Gallery
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImageBase64(reader.result);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setImageBase64('');
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 border border-transparent transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                      Open Camera
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImageBase64(reader.result);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setImageBase64('');
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {imageBase64 && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageBase64('');
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {imageBase64 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-semibold text-slate-500">Preview:</p>
                      <img src={imageBase64} alt="Attachment Preview" className="h-40 w-auto rounded-md border border-slate-200 object-cover" />
                    </div>
                  )}
                </div>

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
            
            {userRole === 'employee' && safeStatus === 'RESOLVED' && String(ticket.reporter_id) === String(currentUser?.id) && (
              <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-700">Resolution Confirmation</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Rating (1-5 Stars)
                  </label>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`text-2xl ${feedbackRating >= star ? 'text-yellow-400' : 'text-slate-300'} hover:text-yellow-400 focus:outline-none transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Comment / Review (Optional)
                  </label>
                  <textarea
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Provide your review regarding the technician's service..."
                    className="mt-1 block w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackSubmitting || statusRequest !== null}
                    className="flex-1 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {feedbackSubmitting ? 'Saving...' : 'Accept & Close Ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReopen}
                    disabled={statusRequest !== null || feedbackSubmitting}
                    className="flex-1 rounded-md border border-red-600 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {statusRequest === 'IN_PROGRESS' ? 'Processing...' : 'Issue Persists (Re-Open)'}
                  </button>
                </div>
              </div>
            )}


            
            {userRole !== 'it_staff' && safeStatus !== 'RESOLVED' && safeStatus !== 'CLOSED' && safeStatus !== 'RE-OPENED' && userRole !== 'superadmin' && (
              <p className="text-center text-sm text-slate-500">Only IT Staff can update ticket status</p>
            )}
            {userRole === 'superadmin' && (safeStatus === 'OPEN' || safeStatus === 'IN_PROGRESS' || safeStatus === 'RE-OPENED') && (
              <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-700">
                  {(safeStatus === 'IN_PROGRESS' || safeStatus === 'RE-OPENED') ? 'Re-assign Technician' : 'Assign to Technician'}
                </h4>
                {(safeStatus === 'IN_PROGRESS' || safeStatus === 'RE-OPENED') && (
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Saat ini ditangani oleh: <span className="font-bold text-slate-700">{ticket.assignee ? `${ticket.assignee}${ticket.assignee_specialization ? ` (${ticket.assignee_specialization})` : ''}` : 'Teknisi'}</span>
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Technician --</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.full_name || tech.fullname} {tech.specialization ? `(${tech.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignSubmit}
                    disabled={!selectedTech || assignRequest}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {assignRequest ? 'Assigning...' : ((safeStatus === 'IN_PROGRESS' || safeStatus === 'RE-OPENED') ? 'Re-assign' : 'Assign')}
                  </button>
                </div>
              </div>
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
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Opened At</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>
              {ticket.inProgressAt && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">In Progress At</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {new Date(ticket.inProgressAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {ticket.reopenedAt && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Re-Opened At</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {new Date(ticket.reopenedAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {ticket.resolvedAt && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-500">Resolved At</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {new Date(ticket.resolvedAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {ticket.closedAt && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed At</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {new Date(ticket.closedAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}