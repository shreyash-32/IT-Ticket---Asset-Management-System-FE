import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Route guard component.
 * - Redirects unauthenticated users to `/login`.
 * - Redirects authenticated users trying to access login/public routes (redirectIfAuthenticated=true) to their role-specific dashboard.
 * - Restricts dashboard routes based on allowedRoles list.
 * 
 * @param {object} props
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {boolean} props.redirectIfAuthenticated - If true, redirects logged-in users away from the route (e.g. login page)
 */
const ProtectedRoute = ({ allowedRoles, redirectIfAuthenticated = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  // Helper to map role to specific dashboard route
  const getDashboardRedirect = (role) => {
    switch (role) {
      case 'Employee':
        return '/dashboard/employee';
      case 'IT Support Engineer':
        return '/dashboard/support';
      case 'Team Lead':
        return '/dashboard/teamlead';
      case 'Administrator':
        return '/dashboard/admin';
      default:
        return '/dashboard/employee';
    }
  };

  // 1. If user is already authenticated and accessing login/public pages, redirect them away
  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={getDashboardRedirect(userRole)} replace />;
  }

  // 2. If user is NOT authenticated and trying to access protected pages, redirect to /login
  if (!redirectIfAuthenticated && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user is authenticated but doesn't have the required role, redirect to their own dashboard
  if (!redirectIfAuthenticated && allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`User role "${userRole}" not authorized. Redirecting to own dashboard.`);
    return <Navigate to={getDashboardRedirect(userRole)} replace />;
  }

  // Allow rendering of the protected child components
  return <Outlet />;
};

export default ProtectedRoute;
