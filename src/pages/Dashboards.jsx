import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import dashboardService, { teamLeadService, adminService } from '../services/dashboardService';
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
  Briefcase,
  Clock
} from 'lucide-react';

// Employee-specific components
import SummaryCards from '../components/employee/SummaryCards';
import MyTicketsTable from '../components/employee/MyTicketsTable';
import TicketDetailModal from '../components/employee/TicketDetailModal';
import RaiseTicketModal from '../components/employee/RaiseTicketModal';
import MyAssetsPanel from '../components/employee/MyAssetsPanel';
import EmployeeProfileCard from '../components/employee/EmployeeProfileCard';
import Toast from '../components/Toast';

// Team Lead-specific components
import TeamLeadSummaryCards from '../components/teamlead/TeamLeadSummaryCards';
import AllTicketsTable from '../components/teamlead/AllTicketsTable';
import AssignTicketModal from '../components/teamlead/AssignTicketModal';
import EscalateTicketModal from '../components/teamlead/EscalateTicketModal';
import TeamWorkloadPanel from '../components/teamlead/TeamWorkloadPanel';
import SLACompliancePanel from '../components/teamlead/SLACompliancePanel';

// Admin-specific components
import AdminSummaryCards from '../components/admin/AdminSummaryCards';
import UserManagement from '../components/admin/UserManagement';
import RolesPermissions from '../components/admin/RolesPermissions';
import CategoryManagement from '../components/admin/CategoryManagement';
import SLAConfiguration from '../components/admin/SLAConfiguration';
import AssetRequestsAdmin from '../components/admin/AssetRequestsAdmin';
import EmailConfiguration from '../components/admin/EmailConfiguration';

/**
 * Shared layout wrapper for dashboards
 */
const DashboardLayout = ({ children, title, roleBadgeColor, activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { name: 'User', email: 'user@company.com', role: 'Employee' };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Activity },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'assets', label: 'Assets', icon: Laptop },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Admin-only items
  if (user.role === 'Administrator') {
    navItems.push({ id: 'settings', label: 'Settings', icon: Settings });
  }

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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange?.(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
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

/* 1. Employee Dashboard — fully wired to the API */
export const EmployeeDashboard = () => {
  const [section, setSection] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [totalTicketCount, setTotalTicketCount] = useState(0);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [assets, setAssets] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);
  const [toast, setToast] = useState(null);

  const PAGE_SIZE = 10;

  // Fetch summary
  useEffect(() => {
    const load = async () => {
      setLoadingSummary(true);
      try {
        const res = await dashboardService.getSummary();
        setSummary(res.data.data);
      } catch (e) {
        console.error('Failed to load summary', e);
      } finally {
        setLoadingSummary(false);
      }
    };
    load();
  }, []);

  // Fetch tickets when status or page changes
  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await dashboardService.getTickets(ticketStatus, ticketPage, PAGE_SIZE);
      const data = res.data.data;
      setTickets(data.items || data.tickets || []);
      setTotalTicketCount(data.totalCount || 0);
    } catch (e) {
      console.error('Failed to load tickets', e);
    } finally {
      setLoadingTickets(false);
    }
  }, [ticketStatus, ticketPage]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Fetch assets
  useEffect(() => {
    if (section !== 'assets' && section !== 'overview') return;
    const load = async () => {
      setLoadingAssets(true);
      try {
        const res = await dashboardService.getAssets();
        setAssets(res.data.data || []);
      } catch (e) {
        console.error('Failed to load assets', e);
      } finally {
        setLoadingAssets(false);
      }
    };
    load();
  }, [section]);

  // Fetch profile
  useEffect(() => {
    if (section !== 'profile') return;
    const load = async () => {
      setLoadingProfile(true);
      try {
        const res = await dashboardService.getProfile();
        setProfile(res.data.data);
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [section]);

  const handleStatusChange = (status) => {
    setTicketStatus(status);
    setTicketPage(1);
  };

  const handleTicketCreated = (ticket) => {
    setToast({ message: `Ticket ${ticket?.number || ''} created successfully!`, variant: 'success' });
    loadTickets();
    // Refresh summary
    dashboardService.getSummary().then((res) => setSummary(res.data.data)).catch(() => {});
  };

  // Section content mapping
  const renderContent = () => {
    switch (section) {
      case 'overview':
        return (
          <>
            <SummaryCards data={summary} loading={loadingSummary} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">My Support Tickets</h3>
              <button
                onClick={() => setShowRaiseTicket(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 py-1.5 px-3 rounded-lg transition-all"
              >
                <PlusCircle size={14} /> Create Request
              </button>
            </div>
            <MyTicketsTable
              tickets={tickets}
              totalCount={totalTicketCount}
              pageNumber={ticketPage}
              pageSize={PAGE_SIZE}
              activeStatus={ticketStatus}
              onStatusChange={handleStatusChange}
              onPageChange={setTicketPage}
              onTicketClick={setSelectedTicketId}
              loading={loadingTickets}
            />
          </>
        );
      case 'tickets':
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">All My Tickets</h3>
              <button
                onClick={() => setShowRaiseTicket(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 py-1.5 px-3 rounded-lg transition-all"
              >
                <PlusCircle size={14} /> Create Request
              </button>
            </div>
            <MyTicketsTable
              tickets={tickets}
              totalCount={totalTicketCount}
              pageNumber={ticketPage}
              pageSize={PAGE_SIZE}
              activeStatus={ticketStatus}
              onStatusChange={handleStatusChange}
              onPageChange={setTicketPage}
              onTicketClick={setSelectedTicketId}
              loading={loadingTickets}
            />
          </>
        );
      case 'assets':
        return <MyAssetsPanel assets={assets} loading={loadingAssets} />;
      case 'profile':
        return <EmployeeProfileCard profile={profile} loading={loadingProfile} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Employee Portal"
      roleBadgeColor="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
      activeSection={section}
      onSectionChange={setSection}
    >
      {renderContent()}

      {/* Modals */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onFeedbackSubmitted={() => loadTickets()}
        />
      )}
      {showRaiseTicket && (
        <RaiseTicketModal
          onClose={() => setShowRaiseTicket(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};

/* 2. IT Support Engineer Dashboard */
export const SupportDashboard = () => {
  const [section, setSection] = useState('overview');
  return (
    <DashboardLayout title="Support Queue Console" roleBadgeColor="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" activeSection={section} onSectionChange={setSection}>
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
};/* 3. Team Lead Dashboard */
export const TeamLeadDashboard = ({ 
  title = "Team Operations Overview", 
  roleBadgeColor = "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" 
}) => {
  const [section, setSection] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [totalTicketCount, setTotalTicketCount] = useState(0);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [ticketPriority, setTicketPriority] = useState(null);
  const [ticketAssignedTo, setTicketAssignedTo] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingWorkload, setLoadingWorkload] = useState(true);
  const [loadingSLA, setLoadingSLA] = useState(true);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [escalatingTicket, setEscalatingTicket] = useState(null);
  const [toast, setToast] = useState(null);

  const PAGE_SIZE = 10;
  const isInitialMount = useRef(true);

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await teamLeadService.getTickets({
        status: ticketStatus || undefined,
        priority: ticketPriority || undefined,
        assignedTo: ticketAssignedTo || undefined,
        pageNumber: ticketPage,
        pageSize: PAGE_SIZE
      });
      const data = res.data.data;
      setTickets(data.items || []);
      setTotalTicketCount(data.totalCount || 0);
    } catch (e) {
      console.error('Failed to load tickets', e);
      setToast({ message: 'Failed to load tickets queue.', variant: 'error' });
    } finally {
      setLoadingTickets(false);
    }
  }, [ticketStatus, ticketPriority, ticketAssignedTo, ticketPage]);

  const refreshMetrics = useCallback(async () => {
    try {
      const [summaryRes, workloadRes, slaRes] = await Promise.all([
        teamLeadService.getSummary(),
        teamLeadService.getWorkload(),
        teamLeadService.getSLA()
      ]);
      setSummary(summaryRes.data.data);
      setWorkload(workloadRes.data.data || []);
      setSlaData(slaRes.data.data || []);
    } catch (e) {
      console.error('Failed to refresh metrics', e);
    }
  }, []);

  // Parallel load on mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoadingSummary(true);
      setLoadingTickets(true);
      setLoadingWorkload(true);
      setLoadingSLA(true);
      setLoadingEngineers(true);

      try {
        const [summaryRes, ticketsRes, workloadRes, slaRes, engineersRes] = await Promise.all([
          teamLeadService.getSummary(),
          teamLeadService.getTickets({
            status: ticketStatus || undefined,
            priority: ticketPriority || undefined,
            assignedTo: ticketAssignedTo || undefined,
            pageNumber: ticketPage,
            pageSize: PAGE_SIZE
          }),
          teamLeadService.getWorkload(),
          teamLeadService.getSLA(),
          teamLeadService.getEngineers()
        ]);

        setSummary(summaryRes.data.data);
        const data = ticketsRes.data.data;
        setTickets(data.items || []);
        setTotalTicketCount(data.totalCount || 0);
        setWorkload(workloadRes.data.data || []);
        setSlaData(slaRes.data.data || []);
        setEngineers(engineersRes.data.data || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
        setToast({ message: "Failed to load dashboard metrics.", variant: "error" });
      } finally {
        setLoadingSummary(false);
        setLoadingTickets(false);
        setLoadingWorkload(false);
        setLoadingSLA(false);
        setLoadingEngineers(false);
      }
    };

    loadAllData();
  }, []);

  // Filter and pagination effect (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadTickets();
  }, [loadTickets]);

  // Load personal assets
  useEffect(() => {
    if (section !== 'assets' && section !== 'overview') return;
    const load = async () => {
      setLoadingAssets(true);
      try {
        const res = await dashboardService.getAssets();
        setAssets(res.data.data || []);
      } catch (e) {
        console.error('Failed to load assets', e);
      } finally {
        setLoadingAssets(false);
      }
    };
    load();
  }, [section]);

  // Load personal profile
  useEffect(() => {
    if (section !== 'profile') return;
    const load = async () => {
      setLoadingProfile(true);
      try {
        const res = await dashboardService.getProfile();
        setProfile(res.data.data);
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [section]);

  const handleStatusChange = (status) => {
    setTicketStatus(status);
    setTicketPage(1);
  };

  const handlePriorityChange = (priority) => {
    setTicketPriority(priority);
    setTicketPage(1);
  };

  const handleAssignedToChange = (assignedTo) => {
    setTicketAssignedTo(assignedTo);
    setTicketPage(1);
  };

  const handleAssigned = (ticket, engineerName) => {
    setToast({
      message: `Ticket ${ticket.number} successfully assigned to ${engineerName}`,
      variant: 'success'
    });
    loadTickets();
    refreshMetrics();
  };

  const handleEscalated = (ticket) => {
    setToast({
      message: `Ticket ${ticket.number} successfully escalated to Critical!`,
      variant: 'success'
    });
    loadTickets();
    refreshMetrics();
  };

  const renderContent = () => {
    switch (section) {
      case 'overview':
        return (
          <div className="space-y-8">
            <TeamLeadSummaryCards data={summary} loading={loadingSummary} />
            
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-6 flex">
                <TeamWorkloadPanel workload={workload} loading={loadingWorkload} />
              </div>
              <div className="lg:col-span-4 flex">
                <SLACompliancePanel slaData={slaData} loading={loadingSLA} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Team Tickets Queue</h3>
              </div>
              <AllTicketsTable
                tickets={tickets}
                totalCount={totalTicketCount}
                pageNumber={ticketPage}
                pageSize={PAGE_SIZE}
                activeStatus={ticketStatus}
                activePriority={ticketPriority}
                activeAssignedTo={ticketAssignedTo}
                engineers={engineers}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onAssignedToChange={handleAssignedToChange}
                onPageChange={setTicketPage}
                onTicketClick={setSelectedTicketId}
                onAssignClick={setAssigningTicket}
                onEscalateClick={setEscalatingTicket}
                loading={loadingTickets}
              />
            </div>
          </div>
        );
      case 'tickets':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">All Tickets</h3>
            </div>
            <AllTicketsTable
              tickets={tickets}
              totalCount={totalTicketCount}
              pageNumber={ticketPage}
              pageSize={PAGE_SIZE}
              activeStatus={ticketStatus}
              activePriority={ticketPriority}
              activeAssignedTo={ticketAssignedTo}
              engineers={engineers}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onAssignedToChange={handleAssignedToChange}
              onPageChange={setTicketPage}
              onTicketClick={setSelectedTicketId}
              onAssignClick={setAssigningTicket}
              onEscalateClick={setEscalatingTicket}
              loading={loadingTickets}
            />
          </div>
        );
      case 'assets':
        return <MyAssetsPanel assets={assets} loading={loadingAssets} />;
      case 'profile':
        return <EmployeeProfileCard profile={profile} loading={loadingProfile} />;
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
            <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-4">
              System Settings
            </h3>
            <p className="text-sm text-slate-650 dark:text-slate-400 mb-6">
              Manage system configurations, roles, and integration settings.
            </p>
            <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center text-slate-400">
              Settings and system administration configuration options will be loaded here.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={title}
      roleBadgeColor={roleBadgeColor}
      activeSection={section}
      onSectionChange={setSection}
    >
      {renderContent()}

      {/* Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onFeedbackSubmitted={() => {
            loadTickets();
            refreshMetrics();
          }}
        />
      )}

      {/* Assign Modal */}
      {assigningTicket && (
        <AssignTicketModal
          ticket={assigningTicket}
          engineers={engineers}
          loadingEngineers={loadingEngineers}
          onClose={() => setAssigningTicket(null)}
          onAssigned={handleAssigned}
        />
      )}

      {/* Escalate Modal */}
      {escalatingTicket && (
        <EscalateTicketModal
          ticket={escalatingTicket}
          onClose={() => setEscalatingTicket(null)}
          onEscalated={handleEscalated}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};

/* 4. Administrator Dashboard */
export const AdminDashboard = () => {
  const [section, setSection] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  
  // Overview tickets queue (reused Team Lead's tickets)
  const [tickets, setTickets] = useState([]);
  const [totalTicketCount, setTotalTicketCount] = useState(0);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [ticketPriority, setTicketPriority] = useState(null);
  const [ticketAssignedTo, setTicketAssignedTo] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  
  // Modals
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [escalatingTicket, setEscalatingTicket] = useState(null);
  const [toast, setToast] = useState(null);

  const PAGE_SIZE = 10;

  // Load summary and overview tickets
  const loadOverviewData = async () => {
    if (section !== 'overview') return;
    setLoadingSummary(true);
    setLoadingTickets(true);
    try {
      const [summaryRes, ticketsRes, engineersRes] = await Promise.all([
        adminService.getSummary(),
        teamLeadService.getTickets({
          status: ticketStatus || undefined,
          priority: ticketPriority || undefined,
          assignedTo: ticketAssignedTo || undefined,
          pageNumber: ticketPage,
          pageSize: PAGE_SIZE
        }),
        teamLeadService.getEngineers()
      ]);
      setSummary(summaryRes.data.data);
      const ticketData = ticketsRes.data.data;
      setTickets(ticketData.items || []);
      setTotalTicketCount(ticketData.totalCount || 0);
      setEngineers(engineersRes.data.data || []);
    } catch (e) {
      console.error('Failed to load Overview data', e);
    } finally {
      setLoadingSummary(false);
      setLoadingTickets(false);
      setLoadingEngineers(false);
    }
  };

  const loadTicketsOnly = async () => {
    if (section !== 'overview') return;
    setLoadingTickets(true);
    try {
      const res = await teamLeadService.getTickets({
        status: ticketStatus || undefined,
        priority: ticketPriority || undefined,
        assignedTo: ticketAssignedTo || undefined,
        pageNumber: ticketPage,
        pageSize: PAGE_SIZE
      });
      setTickets(res.data.data?.items || []);
      setTotalTicketCount(res.data.data?.totalCount || 0);
    } catch (e) {
      console.error('Failed to reload tickets', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, [section]);

  useEffect(() => {
    if (section === 'overview') {
      loadTicketsOnly();
    }
  }, [ticketStatus, ticketPriority, ticketAssignedTo, ticketPage]);

  const handleStatusChange = (status) => {
    setTicketStatus(status);
    setTicketPage(1);
  };

  const handlePriorityChange = (priority) => {
    setTicketPriority(priority);
    setTicketPage(1);
  };

  const handleAssignedToChange = (assignedTo) => {
    setTicketAssignedTo(assignedTo);
    setTicketPage(1);
  };

  const handleAssigned = async (ticket, engineerName) => {
    setToast({
      message: `Ticket ${ticket.number} successfully assigned to ${engineerName}`,
      variant: 'success'
    });
    loadTicketsOnly();
  };

  const handleEscalated = async (ticket) => {
    setToast({
      message: `Ticket ${ticket.number} successfully escalated to Critical!`,
      variant: 'success'
    });
    loadTicketsOnly();
  };

  // Sidebar navigation items for Admin
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: User },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'categories', label: 'Category Management', icon: Layers },
    { id: 'sla', label: 'SLA Configuration', icon: Clock },
    { id: 'asset-requests', label: 'Asset Requests', icon: Briefcase },
    { id: 'email-config', label: 'Email Configuration', icon: Settings }
  ];

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const user = authService.getCurrentUser() || { name: 'Admin', email: 'admin@company.com', role: 'Administrator' };

  const renderContent = () => {
    switch (section) {
      case 'overview':
        return (
          <div className="space-y-6">
            <AdminSummaryCards data={summary} loading={loadingSummary} />
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
              <h4 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-6">
                Active Tickets Queue
              </h4>
              <AllTicketsTable
                tickets={tickets}
                totalCount={totalTicketCount}
                pageNumber={ticketPage}
                pageSize={PAGE_SIZE}
                activeStatus={ticketStatus}
                activePriority={ticketPriority}
                activeAssignedTo={ticketAssignedTo}
                engineers={engineers}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onAssignedToChange={handleAssignedToChange}
                onPageChange={setTicketPage}
                onTicketClick={setSelectedTicketId}
                onAssignClick={setAssigningTicket}
                onEscalateClick={setEscalatingTicket}
                loading={loadingTickets}
              />
            </div>
          </div>
        );
      case 'users':
        return <UserManagement setToast={setToast} />;
      case 'roles':
        return <RolesPermissions setToast={setToast} />;
      case 'categories':
        return <CategoryManagement setToast={setToast} />;
      case 'sla':
        return <SLAConfiguration setToast={setToast} />;
      case 'asset-requests':
        return <AssetRequestsAdmin setToast={setToast} />;
      case 'email-config':
        return <EmailConfiguration setToast={setToast} />;
      default:
        return null;
    }
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
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Administration</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-750 dark:bg-red-950/30 dark:text-red-400">
                {user.role}
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              System Administration console
            </h1>
          </div>
          
          <div className="text-sm text-slate-500 dark:text-slate-400">
            System status: <span className="font-semibold text-emerald-500">Operational</span>
          </div>
        </header>

        {renderContent()}

        {/* Detail Modal */}
        {selectedTicketId && (
          <TicketDetailModal
            ticketId={selectedTicketId}
            onClose={() => setSelectedTicketId(null)}
          />
        )}

        {/* Assign Modal */}
        {assigningTicket && (
          <AssignTicketModal
            ticket={assigningTicket}
            engineers={engineers}
            loadingEngineers={loadingEngineers}
            onClose={() => setAssigningTicket(null)}
            onAssigned={handleAssigned}
          />
        )}

        {/* Escalate Modal */}
        {escalatingTicket && (
          <EscalateTicketModal
            ticket={escalatingTicket}
            onClose={() => setEscalatingTicket(null)}
            onEscalated={handleEscalated}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            variant={toast.variant}
            onClose={() => setToast(null)}
          />
        )}
      </main>

    </div>
  );
};

