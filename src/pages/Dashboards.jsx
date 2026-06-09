import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  LogOut, 
  User, 
  Ticket, 
  Laptop, 
  PlusCircle, 
  ShieldCheck, 
  Database, 
  Activity, 
  TrendingUp, 
  Layers, 
  Settings, 
  Briefcase 
} from 'lucide-react';

/**
 * Shared layout wrapper for dashboards
 */
const DashboardLayout = ({ children, title, roleBadgeColor }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { name: 'User', email: 'user@company.com', role: 'Employee' };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              IT
            </div>
            <div>
              <h2 className="font-heading font-bold text-base tracking-tight leading-tight">IT Manager</h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Asset & Tickets</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 text-white font-medium text-sm transition-all">
              <Activity size={18} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition-all">
              <Ticket size={18} />
              <span>Tickets</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition-all">
              <Laptop size={18} />
              <span>Assets</span>
            </a>
            {user.role === 'Administrator' && (
              <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-sm transition-all">
                <Settings size={18} />
                <span>Settings</span>
              </a>
            )}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-white">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-650/10 text-red-400 border border-red-900/30 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main dashboard content area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadgeColor}`}>
                {user.role}
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {title}
            </h1>
          </div>
          
          <div className="text-sm text-slate-500 dark:text-slate-400">
            System status: <span className="font-semibold text-emerald-500">Operational</span>
          </div>
        </header>

        {children}
      </main>

    </div>
  );
};

/* 1. Employee Dashboard */
export const EmployeeDashboard = () => {
  return (
    <DashboardLayout title="Employee Portal" roleBadgeColor="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">My Open Tickets</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">2</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Assigned Hardware</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">3 Assets</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Pending Orders</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">0</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">My Support Tickets</h3>
          <button className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 py-1.5 px-3 rounded-lg transition-all">
            <PlusCircle size={14} /> Create Request
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Laptop Keyboard replacement</p>
              <span className="text-xs text-slate-400">Created 2 days ago &bull; Ticket ID: #T-982</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-xs font-semibold">
              In Progress
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Unable to access VPN</p>
              <span className="text-xs text-slate-400">Created 4 days ago &bull; Ticket ID: #T-971</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 text-xs font-semibold">
              Assigned
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* 2. IT Support Engineer Dashboard */
export const SupportDashboard = () => {
  return (
    <DashboardLayout title="Support Queue Console" roleBadgeColor="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Unassigned Queue</div>
          <div className="text-3xl font-extrabold text-blue-600">14</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Assigned to Me</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">6</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">SLA Breaches</div>
          <div className="text-3xl font-extrabold text-red-500">1</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Closed Today</div>
          <div className="text-3xl font-extrabold text-green-500">8</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-6">Active Escalations</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Database connection timeouts in Production</p>
              <span className="text-xs text-slate-400">Reporter: Admin Portal &bull; Priority: Critical</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold">
              CRITICAL
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Provisioning MacBook Pro for new Lead Engineer</p>
              <span className="text-xs text-slate-400">Reporter: HR &bull; Priority: High</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 text-xs font-semibold">
              HIGH
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* 3. Team Lead Dashboard */
export const TeamLeadDashboard = () => {
  return (
    <DashboardLayout title="Team Operations Overview" roleBadgeColor="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Team SLA Compliance</div>
          <div className="text-3xl font-extrabold text-purple-600">97.8%</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Pending Purchase approvals</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">4 Requests</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Active Team members</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">8 Online</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-6">Pending Purchase / Asset Approvals</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Developer Laptop Upgrade (Requesting $2,499 MacBook Pro)</p>
              <span className="text-xs text-slate-400">Requested by: Sarah Connor &bull; Department: Engineering</span>
            </div>
            <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-bold transition-all">
              Review
            </button>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Adobe Creative Cloud Suite License renewal</p>
              <span className="text-xs text-slate-400">Requested by: David Miller &bull; Department: Design</span>
            </div>
            <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-bold transition-all">
              Review
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* 4. Administrator Dashboard */
export const AdminDashboard = () => {
  return (
    <DashboardLayout title="System Administration console" roleBadgeColor="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Total Users</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">1,429</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Registered Assets</div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">3,104</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Azure Sync Status</div>
          <div className="text-sm font-semibold text-emerald-500 flex items-center gap-1 mt-2">
            <ShieldCheck size={16} /> Sync Successful (15m ago)
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">Active Servers</div>
          <div className="text-3xl font-extrabold text-emerald-500">4 / 4</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm mb-6">
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-6">Azure AD Integration Logs</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-semibold text-sm text-slate-850 dark:text-slate-250">SSO configuration checked</p>
              <span className="text-xs text-slate-400">Endpoint: https://login.microsoftonline.com/common</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 text-xs font-semibold">
              SUCCESS
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-semibold text-sm text-slate-850 dark:text-slate-250">Security Audit logs uploaded</p>
              <span className="text-xs text-slate-400">Target: Azure Log Analytics workspace</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 text-xs font-semibold">
              SUCCESS
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
