import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PublicHome from './pages/PublicHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Lawyers from './pages/Lawyers';
import Hearings from './pages/Hearings';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import DatabaseUsers from './pages/DatabaseUsers';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import PlsqlLab from './pages/PlsqlLab';

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  // Check if loader has run during this browser session
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('briefcase_loader_shown');
    if (hasLoaded) {
      setInitialLoading(false);
    }
  }, []);

  const handleLoaderComplete = () => {
    sessionStorage.setItem('briefcase_loader_shown', 'true');
    setInitialLoading(false);
  };

  if (initialLoading) {
    return <Loader onComplete={handleLoaderComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Firm Website */}
        <Route path="/" element={<PublicHome />} />

        {/* Authentication Portal */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Law Practice Management Platform */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="cases" element={<Cases />} />
          <Route path="lawyers" element={<Lawyers />} />
          <Route path="hearings" element={<Hearings />} />
          <Route path="documents" element={<Documents />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="finances" element={<Finances />} />
          <Route path="reports" element={<Reports />} />
          <Route path="plsql" element={<PlsqlLab />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="db-users" element={<DatabaseUsers />} />
        </Route>

        {/* Legacy & Direct Route Redirects */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="/clients" element={<Navigate to="/app/clients" replace />} />
        <Route path="/cases" element={<Navigate to="/app/cases" replace />} />
        <Route path="/lawyers" element={<Navigate to="/app/lawyers" replace />} />
        <Route path="/hearings" element={<Navigate to="/app/hearings" replace />} />
        <Route path="/documents" element={<Navigate to="/app/documents" replace />} />
        <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
        <Route path="/finances" element={<Navigate to="/app/finances" replace />} />
        <Route path="/invoices" element={<Navigate to="/app/finances" replace />} />
        <Route path="/payments" element={<Navigate to="/app/finances" replace />} />
        <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
        <Route path="/plsql" element={<Navigate to="/app/plsql" replace />} />
        <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
        <Route path="/db-users" element={<Navigate to="/app/db-users" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
