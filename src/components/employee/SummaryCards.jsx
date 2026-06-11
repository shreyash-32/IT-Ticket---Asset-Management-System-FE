import React from 'react';
import { Ticket, AlertCircle, CheckCircle2, Monitor } from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm animate-pulse">
    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
  </div>
);

const cardConfig = [
  { key: 'totalTickets', label: 'Total Tickets', icon: Ticket, bg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-500', valueColor: 'text-slate-800 dark:text-white' },
  { key: 'openTickets', label: 'Open Tickets', icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-950/20', iconColor: 'text-amber-500', valueColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'resolvedTickets', label: 'Resolved', icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconColor: 'text-emerald-500', valueColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'assignedAssets', label: 'Assigned Assets', icon: Monitor, bg: 'bg-blue-50 dark:bg-blue-950/20', iconColor: 'text-blue-500', valueColor: 'text-blue-600 dark:text-blue-400' },
];

const SummaryCards = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className={`${card.bg} p-5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconColor} bg-white/80 dark:bg-slate-900/60`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {card.label}
              </span>
            </div>
            <div className={`text-3xl font-extrabold ${card.valueColor}`}>
              {data?.[card.key] ?? 0}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
