import React from 'react';
import { Monitor, Laptop, Server, Smartphone, HardDrive, Cpu, Wifi } from 'lucide-react';

const assetIcon = (assetType) => {
  const t = (assetType || '').toLowerCase();
  if (t.includes('laptop')) return Laptop;
  if (t.includes('server')) return Server;
  if (t.includes('phone') || t.includes('mobile')) return Smartphone;
  if (t.includes('monitor') || t.includes('display')) return Monitor;
  if (t.includes('hard') || t.includes('drive') || t.includes('storage')) return HardDrive;
  if (t.includes('network') || t.includes('router') || t.includes('switch')) return Wifi;
  return Cpu;
};

const conditionBadge = (condition) => {
  const map = {
    'New': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    'Good': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'Fair': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Needs Repair': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  };
  return map[condition] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const MyAssetsPanel = ({ assets, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm p-6 mt-6">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm p-6 mt-6">
      <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-5">
        My Assigned Assets
      </h3>

      {assets?.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No assets assigned to you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets?.map((asset) => {
            const Icon = assetIcon(asset.assetType);
            return (
              <div key={asset.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                      {asset.assetName || asset.assetType}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {asset.assetType} · {asset.assetTag || 'No tag'}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {asset.condition && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${conditionBadge(asset.condition)}`}>
                          {asset.condition}
                        </span>
                      )}
                      {asset.serialNumber && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">SN: {asset.serialNumber}</span>
                      )}
                    </div>
                    {asset.assignedDate && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Assigned: {new Date(asset.assignedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssetsPanel;
