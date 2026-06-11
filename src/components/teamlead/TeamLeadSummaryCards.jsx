import React from 'react';
import { Ticket, AlertCircle, CheckCircle2, XCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm animate-pulse">
    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
  </div>
);

const TeamLeadSummaryCards = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const slaBreachedCount = data?.slaBreachedCount ?? 0;
  const criticalOpenCount = data?.criticalOpen ?? 0;

  const cards = [
    {
      key: 'totalTickets',
      label: 'Total Tickets',
      icon: Ticket,
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/20',
      iconBg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-indigo-900 dark:text-indigo-300'
    },
    {
      key: 'openTickets',
      label: 'Open Tickets',
      icon: AlertCircle,
      bg: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20',
      iconBg: 'bg-blue-100/50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-900 dark:text-blue-300'
    },
    {
      key: 'resolvedToday',
      label: 'Resolved Today',
      icon: CheckCircle2,
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20',
      iconBg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-950 dark:text-emerald-300'
    },
    {
      key: 'closedTickets',
      label: 'Closed Tickets',
      icon: XCircle,
      bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-500 dark:text-slate-400',
      valueColor: 'text-slate-800 dark:text-slate-200'
    },
    {
      key: 'slaBreachedCount',
      label: 'SLA Breached',
      icon: ShieldAlert,
      bg: slaBreachedCount > 0 
        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' 
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40',
      iconBg: slaBreachedCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800',
      iconColor: slaBreachedCount > 0 ? 'text-red-650 dark:text-red-400' : 'text-slate-400 dark:text-slate-500',
      valueColor: slaBreachedCount > 0 ? 'text-red-650 dark:text-red-450' : 'text-slate-700 dark:text-slate-300'
    },
    {
      key: 'criticalOpen',
      label: 'Critical Open',
      icon: AlertTriangle,
      bg: criticalOpenCount > 0 
        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' 
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40',
      iconBg: criticalOpenCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800',
      iconColor: criticalOpenCount > 0 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500',
      valueColor: criticalOpenCount > 0 ? 'text-amber-600 dark:text-amber-450' : 'text-slate-700 dark:text-slate-300'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className={`${card.bg} p-4 rounded-xl border shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconColor} ${card.iconBg}`}>
                <Icon size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {card.label}
              </span>
            </div>
            <div className={`text-2xl font-extrabold ${card.valueColor}`}>
              {data?.[card.key] ?? 0}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamLeadSummaryCards;
