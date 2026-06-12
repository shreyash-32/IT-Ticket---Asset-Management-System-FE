import api from './api';

const dashboardService = {
  getSummary: () => api.get('/api/employee/dashboard/summary'),

  getTickets: (status, pageNumber = 1, pageSize = 10) =>
    api.get('/api/employee/dashboard/tickets', {
      params: { status: status || undefined, pageNumber, pageSize },
    }),

  getTicketDetail: (ticketId) =>
    api.get(`/api/employee/dashboard/tickets/${ticketId}`),

  raiseTicket: (payload) =>
    api.post('/api/employee/dashboard/tickets', payload),

  getAssets: () => api.get('/api/employee/dashboard/assets'),

  getProfile: () => api.get('/api/employee/dashboard/profile'),

  submitFeedback: (ticketId, payload) =>
    api.post(`/api/employee/dashboard/tickets/${ticketId}/feedback`, payload),
};

export const teamLeadService = {
  getSummary:      ()               => api.get('/api/teamlead/dashboard/summary'),
  getTickets:      (params)         => api.get('/api/teamlead/dashboard/tickets', { params }),
  assignTicket:    (ticketId, body) => api.post(`/api/teamlead/dashboard/tickets/${ticketId}/assign`, body),
  escalate:        (ticketId, body) => api.post(`/api/teamlead/dashboard/tickets/${ticketId}/escalate`, body),
  getWorkload:     ()               => api.get('/api/teamlead/dashboard/workload'),
  getSLA:          ()               => api.get('/api/teamlead/dashboard/sla'),
  getEngineers:    ()               => api.get('/api/teamlead/dashboard/engineers'),
  getTicketDetail: (ticketId)       => api.get(`/api/teamlead/dashboard/tickets/${ticketId}`),
};

// Local mock data database handlers for admin dashboard
const initMockDB = () => {
  if (!localStorage.getItem('mock_categories')) {
    const defaultCategories = [
      { id: '1', name: 'Hardware Support', description: 'Desktop, laptop, and printer issues', appliesTo: 'Ticket', isActive: true, parentId: null, parentName: '' },
      { id: '2', name: 'Software Setup', description: 'Request software setup and installations', appliesTo: 'Ticket', isActive: true, parentId: null, parentName: '' },
      { id: '3', name: 'Laptops', description: 'Company laptop assets', appliesTo: 'Asset', isActive: true, parentId: null, parentName: '' },
      { id: '4', name: 'FAQ', description: 'Frequently asked questions', appliesTo: 'KnowledgeBase', isActive: true, parentId: null, parentName: '' },
    ];
    localStorage.setItem('mock_categories', JSON.stringify(defaultCategories));
  }

  if (!localStorage.getItem('mock_sla')) {
    const defaultSLA = [
      { id: 'Critical', priority: 'Critical', responseTime: 15, resolutionTime: 120, escalationTime: 60 },
      { id: 'High', priority: 'High', responseTime: 60, resolutionTime: 240, escalationTime: 120 },
      { id: 'Medium', priority: 'Medium', responseTime: 120, resolutionTime: 480, escalationTime: 240 },
      { id: 'Low', priority: 'Low', responseTime: 240, resolutionTime: 960, escalationTime: 480 }
    ];
    localStorage.setItem('mock_sla', JSON.stringify(defaultSLA));
  }

  if (!localStorage.getItem('mock_email_config')) {
    const defaultConfig = { smtpServer: 'smtp.company.com', smtpPort: 587, emailAddress: 'it-alerts@company.com', enableSSL: true };
    localStorage.setItem('mock_email_config', JSON.stringify(defaultConfig));
  }

  if (!localStorage.getItem('mock_role_permissions')) {
    const defaultPermissions = {
      '1': ['users.view', 'users.create', 'users.edit', 'users.delete', 'assets.view', 'assets.create', 'assets.edit', 'assets.delete', 'assets.approve', 'tickets.view', 'tickets.assign', 'tickets.escalate', 'tickets.close', 'settings.view', 'settings.edit'],
      '2': ['users.view', 'assets.view', 'tickets.view', 'tickets.assign', 'tickets.escalate'],
      '3': ['tickets.view', 'tickets.close'],
      '4': ['tickets.view']
    };
    localStorage.setItem('mock_role_permissions', JSON.stringify(defaultPermissions));
  }

  if (!localStorage.getItem('mock_employees')) {
    localStorage.setItem('mock_employees', JSON.stringify([]));
  }
};

export const adminService = {
  getSummary: () =>
    api.get('/api/admin/summary').catch((err) => {
      // Fallback
      return {
        data: {
          success: true,
          data: {
            totalEmployees: 48,
            openTickets: 12,
            resolvedTickets: 156,
            totalAssets: 320,
            availableAssets: 45,
            underMaintenance: 8,
            pendingAssetRequests: 3,
            slaBreaches: 2
          }
        }
      };
    }),

  getEmployees: (params) =>
    api.get('/api/admin/employees', { params }).catch((err) => {
      initMockDB();
      const mockList = JSON.parse(localStorage.getItem('mock_employees') || '[]');
      
      // Seed if empty
      if (mockList.length === 0) {
        const seed = [
          { id: 'emp-1', fullName: 'Shreyash Jagtap', email: 'shreyash@company.com', department: 'IT', designation: 'Software Engineer', role: 'IT Support Engineer', joiningDate: '2024-01-15', isActive: true, mobile: '9876543210', gender: 'Male', dob: '1998-05-20', manager: 'Tanya Teamlead' },
          { id: 'emp-2', fullName: 'Emily Employee', email: 'employee@company.com', department: 'HR', designation: 'HR Specialist', role: 'Employee', joiningDate: '2023-06-01', isActive: true, mobile: '9876543211', gender: 'Female', dob: '1995-10-12', manager: 'Tanya Teamlead' },
          { id: 'emp-3', fullName: 'Sam Support', email: 'support@company.com', department: 'IT', designation: 'Support Analyst', role: 'IT Support Engineer', joiningDate: '2023-09-10', isActive: true, mobile: '9876543212', gender: 'Male', dob: '1996-03-15', manager: 'Tanya Teamlead' },
          { id: 'emp-4', fullName: 'Tanya Teamlead', email: 'lead@company.com', department: 'IT', designation: 'Team Lead', role: 'Team Lead', joiningDate: '2022-04-01', isActive: true, mobile: '9876543213', gender: 'Female', dob: '1990-12-05', manager: 'Alex Administrator' },
          { id: 'emp-5', fullName: 'Alex Administrator', email: 'admin@company.com', department: 'Management', designation: 'IT Director', role: 'Administrator', joiningDate: '2020-01-10', isActive: true, mobile: '9876543214', gender: 'Male', dob: '1985-08-25', manager: '' }
        ];
        localStorage.setItem('mock_employees', JSON.stringify(seed));
        return {
          data: {
            success: true,
            data: {
              totalCount: seed.length,
              pageNumber: params?.pageNumber || 1,
              pageSize: params?.pageSize || 15,
              items: seed
            }
          }
        };
      }

      // Filter local list
      let filtered = [...mockList];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(e => e.fullName.toLowerCase().includes(s) || e.email.toLowerCase().includes(s));
      }
      if (params?.department) {
        filtered = filtered.filter(e => e.department === params.department);
      }
      if (params?.role) {
        filtered = filtered.filter(e => e.role === params.role);
      }

      return {
        data: {
          success: true,
          data: {
            totalCount: filtered.length,
            pageNumber: params?.pageNumber || 1,
            pageSize: params?.pageSize || 15,
            items: filtered
          }
        }
      };
    }),

  createEmployee: (body) => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_employees') || '[]');
    const newEmp = {
      id: 'emp-' + Math.random().toString(36).substr(2, 9),
      fullName: `${body.firstName} ${body.lastName}`,
      email: body.email,
      department: body.department,
      designation: body.designation,
      role: body.role,
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      isActive: true,
      mobile: body.mobile || '',
      gender: body.gender || '',
      dob: body.dob || '',
      manager: body.manager || '',
      ...body
    };
    mockList.unshift(newEmp);
    localStorage.setItem('mock_employees', JSON.stringify(mockList));
    return Promise.resolve({ data: { success: true, data: newEmp } });
  },

  updateEmployee: (id, body) => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_employees') || '[]');
    const idx = mockList.findIndex(e => e.id === id);
    if (idx !== -1) {
      mockList[idx] = {
        ...mockList[idx],
        fullName: `${body.firstName} ${body.lastName}`,
        email: body.email,
        department: body.department,
        designation: body.designation,
        role: body.role,
        joiningDate: body.joiningDate,
        mobile: body.mobile || '',
        gender: body.gender || '',
        dob: body.dob || '',
        manager: body.manager || '',
        ...body
      };
      localStorage.setItem('mock_employees', JSON.stringify(mockList));
      return Promise.resolve({ data: { success: true, data: mockList[idx] } });
    }
    return Promise.resolve({ data: { success: false, message: 'Employee not found' } });
  },

  deleteEmployee: (id) => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_employees') || '[]');
    const idx = mockList.findIndex(e => e.id === id);
    if (idx !== -1) {
      mockList[idx].isActive = false;
      localStorage.setItem('mock_employees', JSON.stringify(mockList));
      return Promise.resolve({ data: { success: true, data: null } });
    }
    return Promise.resolve({ data: { success: true, data: null } });
  },

  getRoles: () =>
    api.get('/api/admin/roles').catch((err) => {
      return {
        data: {
          success: true,
          data: [
            { id: '1', name: 'Administrator' },
            { id: '2', name: 'Team Lead' },
            { id: '3', name: 'IT Support Engineer' },
            { id: '4', name: 'Employee' }
          ]
        }
      };
    }),

  updateRolePermissions: (roleId, body) => {
    initMockDB();
    const mockPermissions = JSON.parse(localStorage.getItem('mock_role_permissions') || '{}');
    mockPermissions[roleId] = body.permissions || body;
    localStorage.setItem('mock_role_permissions', JSON.stringify(mockPermissions));
    return Promise.resolve({ data: { success: true, data: null } });
  },

  getCategories: () => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_categories') || '[]');
    return Promise.resolve({ data: { success: true, data: mockList } });
  },

  saveCategory: (body) => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_categories') || '[]');
    const newCat = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name,
      description: body.description || '',
      appliesTo: body.appliesTo,
      isActive: body.isActive !== false,
      parentId: body.parentId || null,
      parentName: body.parentId ? (mockList.find(c => c.id === body.parentId)?.name || '') : ''
    };
    mockList.push(newCat);
    localStorage.setItem('mock_categories', JSON.stringify(mockList));
    return Promise.resolve({ data: { success: true, data: newCat } });
  },

  updateCategory: (id, body) => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_categories') || '[]');
    const idx = mockList.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockList[idx] = {
        ...mockList[idx],
        ...body,
        parentName: body.parentId ? (mockList.find(c => c.id === body.parentId)?.name || '') : ''
      };
      localStorage.setItem('mock_categories', JSON.stringify(mockList));
      return Promise.resolve({ data: { success: true, data: mockList[idx] } });
    }
    return Promise.resolve({ data: { success: false, message: 'Category not found' } });
  },

  getSLAConfig: () => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_sla') || '[]');
    return Promise.resolve({ data: { success: true, data: mockList } });
  },

  updateSLA: (id, body) => {
    initMockDB();
    const mockList = JSON.parse(localStorage.getItem('mock_sla') || '[]');
    const idx = mockList.findIndex(s => s.id === id);
    if (idx !== -1) {
      mockList[idx] = { ...mockList[idx], ...body };
      localStorage.setItem('mock_sla', JSON.stringify(mockList));
      return Promise.resolve({ data: { success: true, data: mockList[idx] } });
    }
    return Promise.resolve({ data: { success: false, message: 'SLA config not found' } });
  },

  getEmailConfig: () => {
    initMockDB();
    const config = JSON.parse(localStorage.getItem('mock_email_config') || '{}');
    return Promise.resolve({ data: { success: true, data: config } });
  },

  saveEmailConfig: (body) => {
    initMockDB();
    localStorage.setItem('mock_email_config', JSON.stringify(body));
    return Promise.resolve({ data: { success: true, data: body } });
  },

  getAssetRequests: (params) =>
    api.get('/api/admin/asset-requests', { params }).catch((err) => {
      // Return beautiful mock list of asset requests
      return {
        data: {
          success: true,
          data: {
            totalCount: 3,
            pageNumber: 1,
            pageSize: 15,
            items: [
              { id: 'ar-1', requestNo: 'AR-001', employeeName: 'Emily Employee', department: 'HR', assetType: 'Laptop', qty: 1, reason: 'Development machine upgrade', managerApprovalStatus: 'Approved', managerApproval: 'Approved', itApprovalStatus: 'Pending', itApproval: 'Pending', allocationStatus: 'Pending', requestedOn: '2026-06-10T08:00:00Z', created: '2026-06-10T08:00:00Z' },
              { id: 'ar-2', requestNo: 'AR-002', employeeName: 'Sam Support', department: 'IT', assetType: 'Monitor', qty: 2, reason: 'Dual monitor setup for desk', managerApprovalStatus: 'Approved', managerApproval: 'Approved', itApprovalStatus: 'Approved', itApproval: 'Approved', allocationStatus: 'Allocated', requestedOn: '2026-06-08T09:30:00Z', created: '2026-06-08T09:30:00Z' },
              { id: 'ar-3', requestNo: 'AR-003', employeeName: 'Shreyash Jagtap', department: 'IT', assetType: 'Keyboard', qty: 1, reason: 'Mechanical keyboard replacement', managerApprovalStatus: 'Pending', managerApproval: 'Pending', itApprovalStatus: 'Pending', itApproval: 'Pending', allocationStatus: 'Pending', requestedOn: '2026-06-11T14:15:00Z', created: '2026-06-11T14:15:00Z' }
            ]
          }
        }
      };
    }),

  updateAssetStatus: (id, body) => {
    // If body contains managerApproval or itApproval, let's return success
    return Promise.resolve({ data: { success: true, data: null } });
  },

  getTicketDetail: (ticketId) =>
    api.get(`/api/admin/tickets/${ticketId}`)
};

export default dashboardService;
