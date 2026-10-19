import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Lawyers from './pages/Lawyers';
import Hearings from './pages/Hearings';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import DatabaseUsers from './pages/DatabaseUsers';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="cases" element={<Cases />} />
          <Route path="lawyers" element={<Lawyers />} />
          <Route path="hearings" element={<Hearings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="db-users" element={<DatabaseUsers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
