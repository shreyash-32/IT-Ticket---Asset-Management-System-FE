import React from 'react';
import { 
  Users, 
  Ticket, 
  CheckCircle2, 
  Laptop, 
  ShieldCheck, 
  Wrench, 
  ClipboardList, 
  AlertTriangle 
} from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm animate-pulse">
    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
  </div>
);

const AdminSummaryCards = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const pendingAssetRequests = data?.pendingAssetRequests ?? 0;
  const slaBreaches = data?.slaBreaches ?? 0;

  const cards = [
    {
      key: 'totalEmployees',
      label: 'Total Employees',
      icon: Users,
      bg: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20',
      iconBg: 'bg-blue-100/50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-900 dark:text-blue-300'
    },
    {
      key: 'openTickets',
      label: 'Open Tickets',
      icon: Ticket,
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/20',
      iconBg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-indigo-900 dark:text-indigo-300'
    },
    {
      key: 'resolvedTickets',
      label: 'Resolved Tickets',
      icon: CheckCircle2,
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20',
      iconBg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-950 dark:text-emerald-300'
    },
    {
      key: 'totalAssets',
      label: 'Total Assets',
      icon: Laptop,
      bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-500 dark:text-slate-400',
      valueColor: 'text-slate-800 dark:text-slate-200'
    },
    {
      key: 'availableAssets',
      label: 'Available Assets',
      icon: ShieldCheck,
      bg: 'bg-teal-50/50 dark:bg-teal-950/10 border-teal-100 dark:border-teal-900/20',
      iconBg: 'bg-teal-100/50 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      valueColor: 'text-teal-900 dark:text-teal-300'
    },
    {
      key: 'underMaintenance',
      label: 'Under Maint.',
      icon: Wrench,
      bg: 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/20',
      iconBg: 'bg-orange-100/50 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-900 dark:text-orange-300'
    },
    {
      key: 'pendingAssetRequests',
      label: 'Pending Requests',
      icon: ClipboardList,
      bg: pendingAssetRequests > 0 
        ? 'bg-amber-55/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' 
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40',
      iconBg: pendingAssetRequests > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800',
      iconColor: pendingAssetRequests > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500',
      valueColor: pendingAssetRequests > 0 ? 'text-amber-700 dark:text-amber-350' : 'text-slate-700 dark:text-slate-300'
    },
    {
      key: 'slaBreaches',
      label: 'SLA Breaches',
      icon: AlertTriangle,
      bg: slaBreaches > 0 
        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' 
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40',
      iconBg: slaBreaches > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800',
      iconColor: slaBreaches > 0 ? 'text-red-650 dark:text-red-400' : 'text-slate-400 dark:text-slate-500',
      valueColor: slaBreaches > 0 ? 'text-red-650 dark:text-red-450' : 'text-slate-750 dark:text-slate-350'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

export default AdminSummaryCards;
