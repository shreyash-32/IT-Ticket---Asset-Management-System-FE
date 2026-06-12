import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/dashboardService';

const statusBadgeColor = (status) => {
  const map = {
    'Approved': 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

const AssetRequestsAdmin = ({ setToast }) => {
  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAssetRequests({
        status: activeTab === 'All' ? undefined : activeTab,
        pageNumber: page,
        pageSize
      });
      setRequests(res.data.data?.items || []);
      setTotalCount(res.data.data?.totalCount || 0);
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to load asset requests', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, activeTab]);

  const handleAction = async (id, targetColumn, decision) => {
    try {
      // Opts for updating manager approval status or IT approval status
      const payload = {};
      if (targetColumn === 'manager') {
        payload.managerApproval = decision;
      } else {
        payload.itApproval = decision;
      }

      await adminService.updateAssetStatus(id, payload);
      setToast?.({ message: `Request successfully ${decision.toLowerCase()}ed`, variant: 'success' });
      
      // Update local state temporarily for smooth UX
      setRequests(prev => prev.map(req => {
        if (req.id === id) {
          const updated = { ...req };
          if (targetColumn === 'manager') {
            updated.managerApproval = decision;
            updated.managerApprovalStatus = decision;
          } else {
            updated.itApproval = decision;
            updated.itApprovalStatus = decision;
          }
          // If both approved, mark allocation status as Allocated or ready
          if (updated.managerApproval === 'Approved' && updated.itApproval === 'Approved') {
            updated.allocationStatus = 'Allocated';
          } else if (updated.managerApproval === 'Rejected' || updated.itApproval === 'Rejected') {
            updated.allocationStatus = 'Rejected';
          }
          return updated;
        }
        return req;
      }));
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to submit approval decision', variant: 'error' });
    }
  };

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Asset Requests</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400">Review employee hardware allocation requests and manage IT/manager approval queues.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all outline-none ${
                isActive 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/30 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                <th className="px-6 py-4">Request No</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Asset Type</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4 w-1/5">Reason</th>
                <th className="px-6 py-4">Manager Approval</th>
                <th className="px-6 py-4">IT Approval</th>
                <th className="px-6 py-4">Allocation</th>
                <th className="px-6 py-4">Requested On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-400">
                    No asset requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-blue-600 dark:text-blue-450 font-mono">
                      {req.requestNo}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {req.employeeName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-400">
                      {req.department || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-650 dark:text-slate-350 font-medium">
                      {req.assetType}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {req.qty ?? 1}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={req.reason}>
                      {req.reason || '—'}
                    </td>
                    
                    {/* Manager Approval */}
                    <td className="px-6 py-4">
                      {req.managerApproval === 'Pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(req.id, 'manager', 'Approved')}
                            className="p-1 rounded bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-450 transition-colors"
                            title="Approve"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'manager', 'Rejected')}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-450 transition-colors"
                            title="Reject"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeColor(req.managerApproval)}`}>
                          {req.managerApproval}
                        </span>
                      )}
                    </td>

                    {/* IT Approval */}
                    <td className="px-6 py-4">
                      {req.itApproval === 'Pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(req.id, 'it', 'Approved')}
                            className="p-1 rounded bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-450 transition-colors"
                            title="Approve"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'it', 'Rejected')}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-450 transition-colors"
                            title="Reject"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeColor(req.itApproval)}`}>
                          {req.itApproval}
                        </span>
                      )}
                    </td>

                    {/* Allocation Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.allocationStatus === 'Allocated'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : req.allocationStatus === 'Rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {req.allocationStatus || 'Pending'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-450">
                      {req.requestedOn ? new Date(req.requestedOn).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing page {page} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetRequestsAdmin;
