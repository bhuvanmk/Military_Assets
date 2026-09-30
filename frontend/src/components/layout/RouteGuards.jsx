import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-military-green-darkest flex items-center justify-center">
        <LoadingSpinner message="AUTHENTICATING CREDENTIALS..." />
      </div>
    );
  }

  if (!user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-military-green-darkest flex items-center justify-center">
        <LoadingSpinner message="VERIFYING SECURITY CLEARANCE..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const normalizedRole = user.role?.replace('ROLE_', '');
  if (normalizedRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-military-green-darkest flex items-center justify-center">
        <LoadingSpinner message="VERIFYING SECURITY CLEARANCE..." />
      </div>
    );
  }

  if (!user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.replace('ROLE_', '');
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => r.replace('ROLE_', ''))
    : [allowedRoles.replace('ROLE_', '')];

  if (!roles.includes(userRole)) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/403" replace />;
  }

  return children;
};

export const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-military-green-darkest flex items-center justify-center">
        <LoadingSpinner message="AUTHENTICATING CREDENTIALS..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = user.role?.replace('ROLE_', '');
  if (normalizedRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};
