import React from 'react';

const TeamWorkloadPanel = ({ workload, loading }) => {
  // Sort by Total Assigned descending
  const sortedWorkload = [...(workload || [])].sort(
    (a, b) => (b.totalAssignedCount || 0) - (a.totalAssignedCount || 0)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm flex-1">
      <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-4">
        Team Workload
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : sortedWorkload.length === 0 ? (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium">
          No engineers found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4 text-center">Total</th>
                <th className="pb-3 pr-4 text-center">Open</th>
                <th className="pb-3 pr-4 text-center">In Progress</th>
                <th className="pb-3 pr-4 text-center">Resolved</th>
                <th className="pb-3 text-center">SLA Breached</th>
              </tr>
            </thead>
            <tbody>
              {sortedWorkload.map((eng) => (
                <tr key={eng.engineerID} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                    {eng.engineerName}
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-700 dark:text-slate-300 font-bold">
                    {eng.totalAssignedCount}
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-500 dark:text-slate-400">
                    {eng.openCount}
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-500 dark:text-slate-400">
                    {eng.inProgressCount}
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-500 dark:text-slate-400">
                    {eng.resolvedCount}
                  </td>
                  <td className="py-3 text-center">
                    {eng.slaBreachedCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-150 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                        {eng.slaBreachedCount}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-550">
                        0
                      </span>
                    )}
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

export default TeamWorkloadPanel;
