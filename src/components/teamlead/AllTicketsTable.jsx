import React from 'react';
import { ChevronLeft, ChevronRight, UserCheck, ArrowUpCircle } from 'lucide-react';

const STATUS_TABS = ['All', 'Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];

const statusBadge = (status) => {
  const map = {
    'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    'Escalated': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    'Closed': 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[status] || 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400';
};

const priorityBadge = (priority) => {
  const map = {
    'Critical': 'bg-red-100 text-red-755 dark:bg-red-950/30 dark:text-red-400',
    'High': 'bg-orange-100 text-orange-755 dark:bg-orange-950/30 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-755 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Low': 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[priority] || 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-400';
};

const AllTicketsTable = ({ 
  tickets, 
  totalCount, 
  pageNumber, 
  pageSize, 
  activeStatus, 
  activePriority,
  activeAssignedTo,
  engineers,
  onStatusChange, 
  onPriorityChange,
  onAssignedToChange,
  onPageChange, 
  onTicketClick, 
  onAssignClick,
  onEscalateClick,
  loading 
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Range of records shown, e.g. "Showing 1 to 15 of 45 tickets"
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
      
      {/* Filters Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onStatusChange(tab === 'All' ? null : tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                (activeStatus === null && tab === 'All') || activeStatus === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Priority Filter */}
          <select
            value={activePriority || ''}
            onChange={(e) => onPriorityChange(e.target.value || null)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assigned To Filter */}
          <select
            value={activeAssignedTo || ''}
            onChange={(e) => onAssignedToChange(e.target.value || null)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px] md:max-w-none"
          >
            <option value="">All Engineers</option>
            {engineers.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.fullName}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <p className="text-sm font-medium">No tickets found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-3 pr-4">Ticket No</th>
                <th className="pb-3 pr-4">Requester</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Priority</th>
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Raised On</th>
                <th className="pb-3 pr-4">Assigned To</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onTicketClick(ticket.id)}
                  className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    ticket.isSLABreached ? 'border-l-3 border-l-red-500' : ''
                  }`}
                >
                  <td className="py-3 pr-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {ticket.number}
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">
                    {ticket.employeeName}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-500 dark:text-slate-400">
                    {ticket.department || '—'}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                    {ticket.category}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-850 dark:text-slate-200 max-w-[150px] truncate">
                    {ticket.subject}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400 text-xs">
                    {ticket.raisedOn ? new Date(ticket.raisedOn).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                    {ticket.assignedToName || 'Unassigned'}
                  </td>
                  <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Assign Ticket"
                        onClick={() => onAssignClick(ticket)}
                        className="p-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <UserCheck size={14} />
                      </button>
                      <button
                        title="Escalate Ticket"
                        onClick={() => onEscalateClick(ticket)}
                        disabled={ticket.status === 'Escalated' || ticket.status === 'Closed'}
                        className="p-1 rounded bg-amber-50 hover:bg-amber-105 dark:bg-slate-805 dark:hover:bg-slate-705 text-amber-600 dark:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowUpCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Showing {startItem} to {endItem} of {totalCount} tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
              Page {pageNumber} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTicketsTable;
