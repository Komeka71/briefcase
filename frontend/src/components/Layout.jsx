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
  Landmark,
  ChevronRight,
  Shield,
  CircleDot,
  Clock
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, subtitle: 'Practice Perspective' },
    { name: 'Clients', href: '/clients', icon: Users, subtitle: 'Registry & Cursors', badge: 'Req 10.1, 10.4' },
    { name: 'Legal Cases', href: '/cases', icon: BriefcaseIcon, subtitle: 'Matter Management' },
    { name: 'Lawyers', href: '/lawyers', icon: UserCheck, subtitle: 'Firm Counsel' },
    { name: 'Court Hearings', href: '/hearings', icon: Calendar, subtitle: 'Judicial Calendar' },
    { name: 'SQL Operations', href: '/reports', icon: FileCode2, subtitle: 'Lab 11 Suite', badge: 'Req 11.A-C' },
    { name: 'Audit Trail', href: '/audit', icon: History, subtitle: 'Forensic Triggers', badge: 'Req 10.9' },
    { name: 'DB Users & Privileges', href: '/db-users', icon: ShieldCheck, subtitle: 'RBAC Security', badge: 'Req 10.2' },
  ];

  const currentNav = navigation.find(n => n.href === location.pathname) || { name: 'Legal Practice Management', subtitle: 'BriefCase System' };

  return (
    <div className="min-h-screen bg-[#101827] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-[#c9a96e]/30 selection:text-[#dfbe85]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0d1522] border-b border-white/10 px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border border-[#c9a96e]/40 bg-[#18263d] flex items-center justify-center text-[#c9a96e]">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display tracking-[0.2em] text-sm text-white font-semibold">BRIEFCASE</span>
            <span className="text-[10px] text-[#c9a96e] block tracking-widest font-mono">LEX & PRAXIS</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-[#c9a96e]" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 w-72 bg-[#0c1421] text-slate-300 flex-shrink-0 flex flex-col border-r border-white/10 z-50 transition-transform duration-300 ease-in-out md:transition-none shadow-2xl md:shadow-none`}
      >
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c9a96e]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="w-11 h-11 rounded border border-[#c9a96e]/50 bg-gradient-to-br from-[#18263d] to-[#101827] flex items-center justify-center shadow-lg shadow-black/40 group">
              <Landmark className="w-5 h-5 text-[#c9a96e] transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div>
              <div className="font-display tracking-[0.25em] text-base text-white font-semibold flex items-center gap-1.5">
                BRIEFCASE
              </div>
              <div className="text-[10px] text-[#c9a96e] tracking-[0.2em] uppercase font-serif mt-0.5">
                Chambers & Practice
              </div>
            </div>
          </div>
        </div>

        {/* System & DB Status Pill */}
        <div className="mx-4 my-3 px-3.5 py-2.5 rounded bg-[#141f32]/80 border border-white/10 text-xs text-slate-400 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono tracking-wider uppercase text-[10px]">Database Engine</span>
            <span className="flex items-center space-x-1.5 text-emerald-400 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MySQL 8.0</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-white/5">
            <span className="text-slate-500 font-serif">Schema:</span>
            <span className="font-mono text-[#c9a96e] text-[10px]">briefcase • InnoDB</span>
          </div>
        </div>

        {/* Section Eyebrow */}
        <div className="px-6 pt-3 pb-1 text-[10px] font-mono tracking-[0.2em] text-[#a8b2c2]/60 uppercase">
          Jurisprudence Modules
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#18263d] text-white border-l-2 border-[#c9a96e] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-[#c9a96e]' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <div className="truncate">
                    <div className={`font-medium ${isActive ? 'text-white font-semibold' : 'text-slate-300'}`}>
                      {item.name}
                    </div>
                    {item.subtitle && (
                      <div className="text-[10px] text-slate-500 font-serif tracking-wide truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 border ${
                      isActive
                        ? 'bg-[#c9a96e]/15 text-[#dfbe85] border-[#c9a96e]/30'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Session Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0f18]/80 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#18263d] border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e] font-display text-xs font-semibold">
              SV
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 text-xs truncate">Chambers of Counsel</div>
              <div className="text-[10px] text-[#c9a96e] font-mono truncate">Academic DBMS Suite</div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>DBMS CS203</span>
            <span className="text-slate-400">SVNIT Surat</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#101827]">
        {/* Top Architectural Header */}
        <header className="bg-[#0e1624]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-display tracking-widest text-[#c9a96e] uppercase text-[11px]">
              Chambers
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 font-medium font-serif text-sm">
              {currentNav.name}
            </span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span className="hidden sm:inline-block text-slate-400 text-xs font-sans">
              {currentNav.subtitle}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs px-3 py-1 rounded bg-[#18263d]/80 border border-white/10 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[11px] text-slate-300">API Port 5000</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-[11px] text-[#c9a96e]">MySQL 8.0</span>
            </div>

            <div className="flex items-center space-x-2 border-l border-white/10 pl-4">
              <span className="text-xs text-slate-400 font-serif italic hidden md:inline">
                "Justitia Omnibus"
              </span>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Fine Architectural Bottom Credit */}
        <footer className="border-t border-white/5 py-4 px-8 text-center text-xs text-slate-500 font-serif flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 tracking-wider">
            BRIEFCASE • LEGAL PRACTICE & ADVOCACY CASE MANAGEMENT
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Relational Model & Stored Procedures • Sardar Vallabhbhai National Institute of Technology
          </div>
        </footer>
      </div>
    </div>
  );
}
