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
  getSummary:   ()               => api.get('/api/teamlead/dashboard/summary'),
  getTickets:   (params)         => api.get('/api/teamlead/dashboard/tickets', { params }),
  assignTicket: (ticketId, body) => api.post(`/api/teamlead/dashboard/tickets/${ticketId}/assign`, body),
  escalate:     (ticketId, body) => api.post(`/api/teamlead/dashboard/tickets/${ticketId}/escalate`, body),
  getWorkload:  ()               => api.get('/api/teamlead/dashboard/workload'),
  getSLA:       ()               => api.get('/api/teamlead/dashboard/sla'),
  getEngineers: ()               => api.get('/api/teamlead/dashboard/engineers'),
};

export default dashboardService;
