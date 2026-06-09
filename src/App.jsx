import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { 
  EmployeeDashboard, 
  SupportDashboard, 
  TeamLeadDashboard, 
  AdminDashboard 
} from './pages/Dashboards';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public Routes: Redirects logged-in users away from the login page */}
        <Route element={<ProtectedRoute redirectIfAuthenticated={true} />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Dashboard: Employee Role */}
        <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
          <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        </Route>

        {/* Protected Dashboard: IT Support Engineer Role */}
        <Route element={<ProtectedRoute allowedRoles={['IT Support Engineer']} />}>
          <Route path="/dashboard/support" element={<SupportDashboard />} />
        </Route>

        {/* Protected Dashboard: Team Lead Role */}
        <Route element={<ProtectedRoute allowedRoles={['Team Lead']} />}>
          <Route path="/dashboard/teamlead" element={<TeamLeadDashboard />} />
        </Route>

        {/* Protected Dashboard: Administrator Role */}
        <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
