import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import dashboardService from '../../services/dashboardService';

const CATEGORY_MAP = {
  'Hardware': ['Laptop', 'Desktop', 'Monitor', 'Keyboard/Mouse', 'Printer', 'Docking Station', 'Other Hardware'],
  'Software': ['Installation', 'Update/Upgrade', 'License Request', 'Bug/Error', 'Other Software'],
  'Network': ['Internet Connectivity', 'VPN', 'Wi-Fi', 'Network Drive', 'Other Network'],
  'Access & Security': ['Account Unlock', 'Password Reset', 'New Access Request', 'Access Revocation', 'MFA/2FA', 'Other Access'],
  'Email': ['Outlook Issues', 'Distribution List', 'Shared Mailbox', 'Email Migration', 'Other Email'],
  'Security': ['Virus/Malware', 'Phishing Report', 'Data Breach', 'Security Policy', 'Other Security'],
  'ERP / Business Applications': ['SAP', 'CRM', 'HRMS', 'Finance System', 'Other ERP'],
  'Microsoft 365': ['Teams', 'SharePoint', 'OneDrive', 'Power BI', 'Other M365'],
};

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const RaiseTicketModal = ({ onClose, onTicketCreated }) => {
  const [form, setForm] = useState({
    category: '',
    subCategory: '',
    priority: 'Medium',
    subject: '',
    description: '',
    assetType: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const subCategories = CATEGORY_MAP[form.category] || [];

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Category is required';
    if (!form.priority) errs.priority = 'Priority is required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await dashboardService.raiseTicket({
        category: form.category,
        subCategory: form.subCategory || null,
        priority: form.priority,
        subject: form.subject,
        description: form.description,
        assetType: form.assetType || null,
      });
      const created = res.data.data;
      onTicketCreated?.(created);
      onClose();
    } catch (e) {
      setErrors({ submit: 'Failed to raise ticket. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
      errors[field] ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Raise New Ticket</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: '' })}
              className={inputClass('category')}
            >
              <option value="">Select category</option>
              {Object.keys(CATEGORY_MAP).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* SubCategory */}
          {subCategories.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Sub Category</label>
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                className={inputClass('subCategory')}
              >
                <option value="">Select sub category</option>
                {subCategories.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className={inputClass('priority')}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief summary of the issue"
              className={inputClass('subject')}
              maxLength={250}
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the issue..."
              className={inputClass('description')}
              rows={4}
              maxLength={4000}
            />
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">{errors.submit}</div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Submitting...' : 'Raise Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicketModal;
