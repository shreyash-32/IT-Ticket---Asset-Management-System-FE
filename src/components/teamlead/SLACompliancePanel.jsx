import React from 'react';

const priorityBadge = (priority) => {
  const map = {
    'Critical': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    'High': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[priority] || 'bg-slate-100 text-slate-655';
};

const SLACompliancePanel = ({ slaData, loading }) => {
  // Aggregate compliance statistics by Priority from slaData
  const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

  const stats = PRIORITIES.map((priority) => {
    const matchingTickets = (slaData || []).filter(
      (ticket) => ticket.priority === priority
    );
    const total = matchingTickets.length;
    const breached = matchingTickets.filter(
      (ticket) => ticket.isResolutionBreached || ticket.isResponseBreached
    ).length;

    const compliancePct = total > 0 ? ((total - breached) / total) * 100 : 100;

    return {
      priority,
      total,
      breached,
      compliancePct,
    };
  });

  const getBarColor = (pct) => {
    if (pct >= 90) return 'bg-emerald-500/25 dark:bg-emerald-500/15';
    if (pct >= 70) return 'bg-amber-500/25 dark:bg-amber-500/15';
    return 'bg-red-500/25 dark:bg-red-500/15';
  };

  const getTextColor = (pct) => {
    if (pct >= 90) return 'text-emerald-700 dark:text-emerald-400';
    if (pct >= 70) return 'text-amber-700 dark:text-amber-400';
    return 'text-red-700 dark:text-red-450';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm flex-1">
      <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-4">
        SLA Compliance
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
                <th className="pb-3 pr-4">Priority</th>
                <th className="pb-3 pr-4 text-center">Total</th>
                <th className="pb-3 pr-4 text-center">Breached</th>
                <th className="pb-3 text-right">Compliance %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.priority} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge(row.priority)}`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-700 dark:text-slate-300 font-semibold">
                    {row.total}
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-500 dark:text-slate-400">
                    {row.breached}
                  </td>
                  <td className="py-2 text-right relative">
                    <div className="inline-block w-32 h-7 rounded overflow-hidden relative border border-slate-200/30 dark:border-slate-800">
                      {/* Inline Progress Bar Background */}
                      <div 
                        className={`absolute top-0 left-0 h-full ${getBarColor(row.compliancePct)}`} 
                        style={{ width: `${row.compliancePct}%` }}
                      />
                      {/* Text label */}
                      <span className={`absolute inset-0 flex items-center justify-end px-2 text-xs font-bold ${getTextColor(row.compliancePct)} z-10`}>
                        {row.compliancePct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SLACompliancePanel;
