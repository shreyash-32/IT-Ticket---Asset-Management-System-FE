import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, ChevronLeft, ChevronRight, UserMinus, ShieldAlert } from 'lucide-react';
import { adminService } from '../../services/dashboardService';
import EmployeeFormModal from './EmployeeFormModal';

const UserManagement = ({ setToast }) => {
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState(null);

  // Load dropdown lists on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [deptRes, rolesRes] = await Promise.all([
          adminService.getEmployees().then(() => {
            // Hardcoded departments fallback since we don't have a direct lookup in standard user service
            return { data: { data: [{ id: '1', name: 'IT' }, { id: '2', name: 'HR' }, { id: '3', name: 'Finance' }, { id: '4', name: 'Management' }] } };
          }),
          adminService.getRoles()
        ]);
        setDepartments(deptRes.data.data || []);
        setRoles(rolesRes.data.data || []);
      } catch (e) {
        console.error('Failed to load filters', e);
      }
    };
    loadFilters();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await adminService.getEmployees({
        search: search || undefined,
        department: department || undefined,
        role: role || undefined,
        pageNumber: page,
        pageSize
      });
      setEmployees(res.data.data?.items || []);
      setTotalCount(res.data.data?.totalCount || 0);
    } catch (e) {
      console.error('Failed to load employees', e);
      setToast?.({ message: 'Failed to load employees list', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, search, department, role]);

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleDeactivate = async () => {
    if (!deactivatingEmployee) return;
    try {
      await adminService.deleteEmployee(deactivatingEmployee.id);
      setToast?.({ message: `Successfully deactivated ${deactivatingEmployee.fullName}`, variant: 'success' });
      setDeactivatingEmployee(null);
      loadEmployees();
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to deactivate employee', variant: 'error' });
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">User Management</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400">View, add, edit, and deactivate system users.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 py-2.5 px-4 rounded-xl shadow-md shadow-blue-550/10 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 focus:bg-white dark:focus:bg-slate-950 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Workspace */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-950/30 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joining Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {emp.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-350">
                      {emp.department || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-350">
                      {emp.designation || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-350">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
                        {emp.role || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        emp.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                          title="Edit Employee"
                        >
                          <Edit2 size={16} />
                        </button>
                        {emp.isActive && (
                          <button
                            onClick={() => setDeactivatingEmployee(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                            title="Deactivate Employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing page {page} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadEmployees();
          }}
          setToast={setToast}
        />
      )}

      {/* Custom Deactivate Confirmation Modal */}
      {deactivatingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeactivatingEmployee(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-2xl overflow-hidden p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-650 dark:text-red-400 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center flex-shrink-0">
                <UserMinus size={20} />
              </div>
              <h4 className="font-heading font-bold text-base">Deactivate Employee</h4>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to deactivate <span className="font-semibold text-slate-800 dark:text-white">{deactivatingEmployee.fullName}</span>? This will revoke their access.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeactivatingEmployee(null)}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-all text-slate-650 dark:text-slate-350"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-650 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-550/15"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
