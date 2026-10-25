import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Guards the private /app area: only logged-in users (JWT in localStorage)
 * can reach the dashboard. Everyone else is sent to /login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('briefcase_token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
