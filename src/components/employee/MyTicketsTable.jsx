import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_TABS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const statusBadge = (status) => {
  const map = {
    'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    'Closed': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const priorityBadge = (priority) => {
  const map = {
    'Critical': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    'High': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[priority] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const MyTicketsTable = ({ tickets, totalCount, pageNumber, pageSize, activeStatus, onStatusChange, onPageChange, onTicketClick, loading }) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-4 pb-0 overflow-x-auto">
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
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Priority</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Raised On</th>
                <th className="pb-3">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onTicketClick(ticket.id)}
                  className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    ticket.isSLABreached ? 'border-l-3 border-l-red-400' : ''
                  }`}
                >
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{ticket.number}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{ticket.subject}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{ticket.category}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(ticket.created).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">{ticket.assignedToName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Page {pageNumber} of {totalPages} · {totalCount} total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
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

export default MyTicketsTable;
