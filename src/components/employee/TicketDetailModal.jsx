import React, { useEffect, useState, useRef } from 'react';
import { X, AlertTriangle, Star, Paperclip, MessageSquare, Clock } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const statusBadge = (status) => {
  const map = {
    'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    'Closed': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

const priorityBadge = (priority) => {
  const map = {
    'Critical': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    'High': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[priority] || 'bg-slate-100 text-slate-600';
};

const TicketDetailModal = ({ ticketId, onClose, onFeedbackSubmitted }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getTicketDetail(ticketId);
        setTicket(res.data.data);
      } catch (e) {
        console.error('Failed to load ticket detail', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketId]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleFeedback = async () => {
    if (feedbackRating < 1) return;
    setSubmittingFeedback(true);
    try {
      await dashboardService.submitFeedback(ticketId, {
        rating: feedbackRating,
        comments: feedbackComments,
      });
      setFeedbackMsg('Thank you for your feedback!');
      onFeedbackSubmitted?.();
    } catch (e) {
      setFeedbackMsg('Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const canShowFeedback =
    ticket &&
    (ticket.status === 'Resolved' || ticket.status === 'Closed') &&
    ticket.feedbackRating == null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-white">
            Ticket Details
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : !ticket ? (
          <div className="p-6 text-center text-slate-400">Ticket not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Ticket header */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{ticket.number}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(ticket.status)}`}>{ticket.status}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadge(ticket.priority)}`}>{ticket.priority}</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-800 dark:text-white mb-1">{ticket.subject}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{ticket.category}{ticket.subCategory ? ` › ${ticket.subCategory}` : ''}</p>
            </div>

            {/* Description */}
            {ticket.description && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Assigned To</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{ticket.assignedToName || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Resolution Due</span>
                <div className="flex items-center gap-1.5">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {ticket.resolutionDueDate ? new Date(ticket.resolutionDueDate).toLocaleDateString() : '—'}
                  </p>
                  {ticket.isSLABreached && (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                      <AlertTriangle size={12} /> SLA Breached
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Created</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{new Date(ticket.created).toLocaleDateString()}</p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Resolved</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{new Date(ticket.resolvedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Comments */}
            {ticket.comments?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <MessageSquare size={14} /> Comments ({ticket.comments.length})
                </h4>
                <div className="space-y-3">
                  {ticket.comments
                    .filter((c) => !c.isInternal)
                    .map((c) => (
                      <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.commentedByName}</span>
                          <span className="text-xs text-slate-400">{new Date(c.commentedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{c.commentText}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {ticket.attachments?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Paperclip size={14} /> Attachments ({ticket.attachments.length})
                </h4>
                <div className="space-y-2">
                  {ticket.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Paperclip size={14} />
                      <span className="font-medium">{a.fileName}</span>
                      <span className="text-xs text-slate-400">({(a.fileSizeBytes / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {canShowFeedback && !feedbackMsg && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Rate this ticket</h4>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setFeedbackHover(star)}
                      onMouseLeave={() => setFeedbackHover(0)}
                      onClick={() => setFeedbackRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (feedbackHover || feedbackRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Any additional comments..."
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleFeedback}
                  disabled={feedbackRating < 1 || submittingFeedback}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            )}
            {feedbackMsg && (
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-lg">
                {feedbackMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailModal;
