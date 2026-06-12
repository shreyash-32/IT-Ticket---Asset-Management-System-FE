import React, { useState, useEffect } from 'react';
import { Save, Edit2, Check, X, Clock } from 'lucide-react';
import { adminService } from '../../services/dashboardService';

const priorityBadgeColor = (priority) => {
  const map = {
    'Critical': 'bg-red-100 text-red-750 dark:bg-red-950/30 dark:text-red-400',
    'High': 'bg-orange-105 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450'
  };
  return map[priority] || 'bg-slate-100 text-slate-650';
};

const toHumanReadable = (minutes) => {
  const min = parseInt(minutes, 10);
  if (isNaN(min) || min <= 0) return '—';
  if (min < 60) return `${min} m`;
  const hrs = min / 60;
  if (hrs < 24) {
    return `${Number(hrs.toFixed(1))} hr${hrs > 1 ? 's' : ''}`;
  }
  const days = hrs / 24;
  return `${Number(days.toFixed(1))} day${days > 1 ? 's' : ''}`;
};

const SLAConfiguration = ({ setToast }) => {
  const [slaList, setSlaList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Row being edited
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({
    responseTime: 0,
    resolutionTime: 0,
    escalationTime: 0
  });

  const loadSLA = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSLAConfig();
      setSlaList(res.data.data || []);
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to load SLA configuration', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSLA();
  }, []);

  const handleEditStart = (row) => {
    setEditingId(row.id);
    setEditRow({
      responseTime: row.responseTime,
      resolutionTime: row.resolutionTime,
      escalationTime: row.escalationTime
    });
  };

  const handleSave = async (id, priority) => {
    if (editRow.responseTime <= 0 || editRow.resolutionTime <= 0 || editRow.escalationTime <= 0) {
      setToast?.({ message: 'All times must be greater than 0 minutes', variant: 'warning' });
      return;
    }
    try {
      await adminService.updateSLA(id, editRow);
      setToast?.({ message: `SLA targets updated for ${priority} priority`, variant: 'success' });
      setEditingId(null);
      loadSLA();
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to update SLA target', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">SLA Configuration</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400">Configure response, resolution, and escalation times (in minutes) for each ticket priority level.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-950/30 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
              <th className="px-6 py-4">Priority Level</th>
              <th className="px-6 py-4">Response Target (min)</th>
              <th className="px-6 py-4">Resolution Target (min)</th>
              <th className="px-6 py-4">Escalation Threshold (min)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : slaList.map((row) => {
              const isEditing = editingId === row.id;
              return (
                <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                  {/* Priority cell */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${priorityBadgeColor(row.priority)}`}>
                      {row.priority}
                    </span>
                  </td>

                  {/* Response target */}
                  <td className="px-6 py-4 text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editRow.responseTime}
                          onChange={(e) => setEditRow(prev => ({ ...prev, responseTime: parseInt(e.target.value) || 0 }))}
                          className="w-20 px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs outline-none"
                        />
                        <span className="text-[10px] text-slate-400 truncate">({toHumanReadable(editRow.responseTime)})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                        <span>{row.responseTime} min</span>
                        <span className="text-slate-400 font-normal">({toHumanReadable(row.responseTime)})</span>
                      </div>
                    )}
                  </td>

                  {/* Resolution target */}
                  <td className="px-6 py-4 text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editRow.resolutionTime}
                          onChange={(e) => setEditRow(prev => ({ ...prev, resolutionTime: parseInt(e.target.value) || 0 }))}
                          className="w-20 px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs outline-none"
                        />
                        <span className="text-[10px] text-slate-400 truncate">({toHumanReadable(editRow.resolutionTime)})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                        <span>{row.resolutionTime} min</span>
                        <span className="text-slate-400 font-normal">({toHumanReadable(row.resolutionTime)})</span>
                      </div>
                    )}
                  </td>

                  {/* Escalation threshold */}
                  <td className="px-6 py-4 text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editRow.escalationTime}
                          onChange={(e) => setEditRow(prev => ({ ...prev, escalationTime: parseInt(e.target.value) || 0 }))}
                          className="w-20 px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs outline-none"
                        />
                        <span className="text-[10px] text-slate-400 truncate">({toHumanReadable(editRow.escalationTime)})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                        <span>{row.escalationTime} min</span>
                        <span className="text-slate-400 font-normal">({toHumanReadable(row.escalationTime)})</span>
                      </div>
                    )}
                  </td>

                  {/* Actions cell */}
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleSave(row.id, row.priority)}
                          className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                          title="Save SLA target"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStart(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                        title="Edit targets inline"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SLAConfiguration;
