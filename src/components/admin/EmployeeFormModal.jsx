import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminService } from '../../services/dashboardService';

const designationMap = {
  'IT': ['Software Engineer', 'Support Analyst', 'Team Lead', 'IT Director'],
  'HR': ['HR Specialist', 'Recruiter', 'HR Manager'],
  'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager'],
  'Management': ['Director', 'VP', 'CEO']
};

const EmployeeFormModal = ({ employee, onClose, onSuccess, setToast }) => {
  const isEdit = !!employee;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    mobile: '',
    department: '',
    designation: '',
    role: '',
    manager: '',
    gender: '',
    dob: '',
    joiningDate: new Date().toISOString().split('T')[0],
    password: ''
  });

  const [allEmployees, setAllEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadModalData = async () => {
      try {
        const [empRes, rolesRes] = await Promise.all([
          adminService.getEmployees(),
          adminService.getRoles()
        ]);
        setAllEmployees(empRes.data.data?.items || []);
        setRoles(rolesRes.data.data || []);
      } catch (e) {
        console.error('Failed to load form lookup data', e);
      }
    };
    loadModalData();
  }, []);

  useEffect(() => {
    if (isEdit && employee) {
      // Split full name into first, last, middle
      const parts = employee.fullName ? employee.fullName.split(' ') : [];
      let firstName = parts[0] || '';
      let lastName = parts[parts.length - 1] || '';
      let middleName = parts.slice(1, parts.length - 1).join(' ');
      
      setFormData({
        firstName: employee.firstName || firstName,
        lastName: employee.lastName || lastName,
        middleName: employee.middleName || middleName,
        email: employee.email || '',
        mobile: employee.mobile || '',
        department: employee.department || '',
        designation: employee.designation || '',
        role: employee.role || '',
        manager: employee.manager || '',
        gender: employee.gender || '',
        dob: employee.dob ? employee.dob.split('T')[0] : '',
        joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
        password: ''
      });
    }
  }, [employee, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset designation if department changes
      if (name === 'department') {
        updated.designation = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Password is required for new accounts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      if (isEdit) {
        await adminService.updateEmployee(employee.id, formData);
        setToast?.({ message: 'Employee updated successfully!', variant: 'success' });
      } else {
        await adminService.createEmployee(formData);
        setToast?.({ message: 'Employee created successfully!', variant: 'success' });
      }
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setToast?.({ message: isEdit ? 'Failed to update employee' : 'Failed to create employee', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter designations based on selected department
  const availableDesignations = designationMap[formData.department] || [];

  // Exclude current employee from manager dropdown
  const potentialManagers = allEmployees.filter(e => !isEdit || e.id !== employee.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">
            {isEdit ? 'Edit Employee Profile' : 'Add New Employee'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 ${
                  errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.firstName && <span className="text-[10px] text-red-500 mt-1 block">{errors.firstName}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 ${
                  errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.lastName && <span className="text-[10px] text-red-500 mt-1 block">{errors.lastName}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 ${
                  errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.email && <span className="text-[10px] text-red-500 mt-1 block">{errors.email}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
              </select>
              {errors.department && <span className="text-[10px] text-red-500 mt-1 block">{errors.department}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                disabled={!formData.department}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 disabled:opacity-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Designation</option>
                {availableDesignations.map((d, idx) => (
                  <option key={idx} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
              {errors.role && <span className="text-[10px] text-red-500 mt-1 block">{errors.role}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Manager</label>
              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Manager</option>
                {potentialManagers.map((m) => (
                  <option key={m.id} value={m.fullName}>{m.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.joiningDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.joiningDate && <span className="text-[10px] text-red-500 mt-1 block">{errors.joiningDate}</span>}
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-450 uppercase mb-1.5">Password *</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Type plain text password"
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-950/40 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 ${
                  errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.password && <span className="text-[10px] text-red-500 mt-1 block">{errors.password}</span>}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-all text-slate-650 dark:text-slate-350"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-md shadow-blue-550/15"
            >
              {submitting ? 'Submitting...' : isEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
