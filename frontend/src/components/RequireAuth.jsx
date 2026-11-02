import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser, getToken } from '../lib/auth';

/**
 * Authentication & Role Route Guard
 * Renders its children or a <Navigate>. Outputs no markup of its own.
 * Takes an optional `roles` prop.
 */
export default function RequireAuth({ children, roles }) {
  const token = getToken();
  const user = getUser();

  // No token or user session -> redirect to /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if specific roles are required
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
