import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { teamLeadService } from '../../services/dashboardService';

const AssignTicketModal = ({ ticket, engineers, loadingEngineers, onClose, onAssigned }) => {
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
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
    if (!selectedEngineerId) return;
    setSubmitting(true);
    setError('');

    try {
      await teamLeadService.assignTicket(ticket.id, {
        assignedToID: selectedEngineerId
      });

      const selectedEng = engineers.find(eng => eng.id === selectedEngineerId);
      onAssigned?.(ticket, selectedEng?.fullName || 'Selected Engineer');
      onClose();
    } catch (e) {
      console.error(e);
      const errMsg = e.response?.data?.message || 'Failed to assign ticket. Please try again.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

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
            <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Assign Ticket</h2>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold">
              {ticket.number}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Engineer Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Select Support Engineer <span className="text-red-500">*</span>
            </label>
            
            {loadingEngineers ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 p-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Loading engineers...</span>
              </div>
            ) : (
              <select
                value={selectedEngineerId}
                onChange={(e) => setSelectedEngineerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Choose an engineer...</option>
                {engineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Remarks Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add assignment instructions or notes..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-[10px] text-slate-400 mt-1">
              {remarks.length} / 500 chars
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
              disabled={submitting || !selectedEngineerId}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AssignTicketModal;
