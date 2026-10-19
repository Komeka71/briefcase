import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  Users,
  Briefcase as BriefcaseIcon,
  UserCheck,
  Calendar,
  FileCode2,
  History,
  ShieldCheck,
  Database,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users, badge: 'Req 10.1, 10.4, 10.5' },
    { name: 'Legal Cases', href: '/cases', icon: BriefcaseIcon },
    { name: 'Lawyers', href: '/lawyers', icon: UserCheck },
    { name: 'Court Hearings', href: '/hearings', icon: Calendar },
    { name: 'SQL Operations / Asgn 11', href: '/reports', icon: FileCode2, badge: 'Req 11.A-C' },
    { name: 'Audit Trail', href: '/audit', icon: History, badge: 'Req 10.9' },
    { name: 'DB Users & Privileges', href: '/db-users', icon: ShieldCheck, badge: 'Req 10.2, 10.3' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <Scale className="w-6 h-6 text-amber-400" />
          <span className="font-bold text-lg tracking-tight">BriefCase</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">SVNIT</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 text-slate-200 flex-shrink-0 flex flex-col border-r border-slate-800 z-30`}
      >
        {/* Brand Header */}
        <div className="hidden md:flex items-center space-x-3 px-6 py-5 border-b border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30">
            <Scale className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-wide">BriefCase</div>
            <div className="text-xs text-slate-400 font-medium">Law Firm Management</div>
          </div>
        </div>

        {/* Academic Context Badge */}
        <div className="mx-4 my-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400">
          <div className="font-semibold text-amber-400 flex items-center space-x-1">
            <Database className="w-3.5 h-3.5" />
            <span>Clients</span>
          </div>
          <div className="mt-0.5 text-slate-400">Law Firm</div>
          <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MySQL 8.0 Connected</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User / DB Session Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-300">DB Session:</span>
            <span className="font-mono text-emerald-400 font-semibold">briefcase</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-slate-400">
            <span>Engine:</span>
            <span>InnoDB (Row Locks)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              DBMS Project Implementation
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500">Law Firm Database Workbench</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">Backend API:</span>
              <code className="text-slate-800 font-mono">http://localhost:5000</code>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
