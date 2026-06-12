import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckSquare, Square, Save } from 'lucide-react';
import { adminService } from '../../services/dashboardService';

const permissionGroups = [
  {
    module: 'User Management',
    permissions: [
      { key: 'users.view', label: 'View Employees', desc: 'Allows viewing active and inactive employee listings.' },
      { key: 'users.create', label: 'Create Employees', desc: 'Allows adding new employee accounts and setting credentials.' },
      { key: 'users.edit', label: 'Edit Employees', desc: 'Allows updating employee profile info and designations.' },
      { key: 'users.delete', label: 'Deactivate Employees', desc: 'Allows blocking employee accounts and revoking access.' }
    ]
  },
  {
    module: 'Asset Management',
    permissions: [
      { key: 'assets.view', label: 'View Assets', desc: 'Allows viewing full company hardware/software inventories.' },
      { key: 'assets.create', label: 'Add Assets', desc: 'Allows entering new hardware assets with serial numbers.' },
      { key: 'assets.edit', label: 'Edit Assets', desc: 'Allows updating asset specifications, location, and status.' },
      { key: 'assets.delete', label: 'Remove Assets', desc: 'Allows retiring or deleting old asset catalog entries.' },
      { key: 'assets.approve', label: 'Review Asset Requests', desc: 'Allows approving or rejecting employee hardware requests.' }
    ]
  },
  {
    module: 'Ticket Management',
    permissions: [
      { key: 'tickets.view', label: 'View Tickets', desc: 'Allows reading support ticket description and comments.' },
      { key: 'tickets.assign', label: 'Assign Tickets', desc: 'Allows assigning unassigned tickets to team engineers.' },
      { key: 'tickets.escalate', label: 'Escalate Tickets', desc: 'Allows upgrading priority levels of unresolved items.' },
      { key: 'tickets.close', label: 'Close Tickets', desc: 'Allows marking resolved tickets as formally closed.' }
    ]
  },
  {
    module: 'System Settings',
    permissions: [
      { key: 'settings.view', label: 'View Settings', desc: 'Allows reading general SMTP, SLA, and category configs.' },
      { key: 'settings.edit', label: 'Modify Settings', desc: 'Allows editing system-wide properties, SMTP configs, and category lists.' }
    ]
  }
];

const RolesPermissions = ({ setToast }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedPermissions, setCheckedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const res = await adminService.getRoles();
        const roleList = res.data.data || [];
        setRoles(roleList);
        if (roleList.length > 0) {
          setSelectedRole(roleList[0]);
        }
      } catch (e) {
        console.error(e);
        setToast?.({ message: 'Failed to load system roles', variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadRoles();
  }, []);

  // Pre-fill checkboxes based on selected role
  useEffect(() => {
    if (!selectedRole) return;
    
    const mockPermissions = JSON.parse(localStorage.getItem('mock_role_permissions') || '{}');
    const assigned = mockPermissions[selectedRole.id] || [];
    setCheckedPermissions(assigned);
  }, [selectedRole]);

  const handlePermissionToggle = (key) => {
    setCheckedPermissions(prev => 
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await adminService.updateRolePermissions(selectedRole.id, {
        permissions: checkedPermissions
      });
      setToast?.({ message: `Permissions updated for ${selectedRole.name}`, variant: 'success' });
    } catch (e) {
      console.error(e);
      setToast?.({ message: 'Failed to save role permissions', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">Roles & Permissions</h3>
        <p className="text-xs text-slate-450 dark:text-slate-400">Configure what access rights and features are assigned to different roles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Left Column: Roles list */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-4 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block px-2">Select User Role</span>
          {roles.map((r) => {
            const isSelected = selectedRole?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                  isSelected 
                    ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <Shield size={16} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Checkbox Checklist */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                  Permissions config: <span className="text-blue-600 dark:text-blue-400">{selectedRole?.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">Select the access modules you wish to enable.</p>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 disabled:opacity-50 py-2 px-3.5 rounded-lg transition-all"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="space-y-6">
              {permissionGroups.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {group.module}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.permissions.map((p) => {
                      const isChecked = checkedPermissions.includes(p.key);
                      return (
                        <div
                          key={p.key}
                          onClick={() => handlePermissionToggle(p.key)}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/5'
                              : 'border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10'
                          }`}
                        >
                          <div className={`mt-0.5 ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                            {isChecked ? <CheckSquare size={16} className="fill-blue-100 dark:fill-blue-950/20" /> : <Square size={16} />}
                          </div>
                          <div>
                            <span className={`text-xs font-semibold block ${isChecked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                              {p.label}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal block mt-0.5">
                              {p.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
