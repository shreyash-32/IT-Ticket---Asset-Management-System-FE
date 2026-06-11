import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { teamLeadService } from '../../services/dashboardService';

const EscalateTicketModal = ({ ticket, onClose, onEscalated }) => {
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (remarks.trim().length < 10) return;
    setSubmitting(true);
    setError('');

    try {
      // API call does not take a request body per schema
      await teamLeadService.escalate(ticket.id);

      onEscalated?.(ticket);
      onClose();
    } catch (e) {
      console.error(e);
      const errMsg = e.response?.data?.message || 'Failed to escalate ticket. Please try again.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const isInvalid = remarks.trim().length < 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Escalate Ticket</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 font-mono text-xs font-semibold">
              {ticket.number}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Warning Message */}
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 rounded-lg font-medium">
            Warning: Escalating will mark this support ticket priority as Critical immediately.
          </div>

          {/* Reason for Escalation */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Reason for Escalation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide a detailed reason for the escalation (min 10 characters)..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={4}
              required
            />
            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className={remarks.trim().length >= 10 ? 'text-emerald-500' : 'text-slate-450'}>
                {remarks.trim().length} / min 10 chars
              </span>
            </div>
          </div>

          {/* Inline Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isInvalid}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-750 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Escalating...' : 'Escalate'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EscalateTicketModal;
