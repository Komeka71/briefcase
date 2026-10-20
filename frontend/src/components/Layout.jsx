import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';
import {
  LayoutDashboard,
  Users,
  Briefcase as BriefcaseIcon,
  UserCheck,
  Calendar,
  FileCode2,
  History,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ExternalLink,
  Shield,
  Compass,
  FolderOpen,
  CheckSquare,
  Receipt
} from 'lucide-react';
import OnboardingModal from './OnboardingModal';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('briefcase_user');
      return saved ? JSON.parse(saved) : { name: 'Senior Partner', role: 'Admin', email: 'admin@briefcase.in' };
    } catch {
      return { name: 'Senior Partner', role: 'Admin', email: 'admin@briefcase.in' };
    }
  });

  // Check if onboarding has been shown
  useEffect(() => {
    const onboarded = localStorage.getItem('briefcase_onboarded');
    if (!onboarded) {
      setOnboardingOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('briefcase_token');
    localStorage.removeItem('briefcase_user');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard, subtitle: 'Practice Metrics & Dockets' },
    { name: 'Clients Registry', href: '/app/clients', icon: Users, subtitle: 'Pagination, Cursors & XML', badge: 'SP Engine' },
    { name: 'Legal Cases', href: '/app/cases', icon: BriefcaseIcon, subtitle: 'Matter Dockets & Budgets' },
    { name: 'Chambers Counsel', href: '/app/lawyers', icon: UserCheck, subtitle: 'Advocates & Departments' },
    { name: 'Court Hearings', href: '/app/hearings', icon: Calendar, subtitle: 'Cause Lists & Bench Orders' },
    { name: 'Document Vault', href: '/app/documents', icon: FolderOpen, subtitle: 'Exhibits & Pleading Briefs' },
    { name: 'Action Items', href: '/app/tasks', icon: CheckSquare, subtitle: 'Deadlines & Trial Prep' },
    { name: 'Billing & Ledgers', href: '/app/finances', icon: Receipt, subtitle: 'Retainers & Fee Receipts' },
    { name: 'SQL Analytics Lab', href: '/app/reports', icon: FileCode2, subtitle: 'Joins, Subqueries & Views', badge: 'Analytics' },
    { name: 'Activity History', href: '/app/audit', icon: History, subtitle: 'Forensic Trigger Logs', badge: 'Audited' },
    { name: 'Security & RBAC', href: '/app/db-users', icon: ShieldCheck, subtitle: 'Stored Proc & DB Accounts', badge: 'Protected' },
  ];

  const currentNav = navigation.find(n => n.href === location.pathname) || {
    name: 'Practice Management',
    subtitle: 'Chambers Operations'
  };

  return (
    <div className="h-screen w-full bg-[#070b14] text-[#f5f0e7] flex flex-col md:flex-row overflow-hidden antialiased selection:bg-[#1e293b] selection:text-white">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        userName={user?.name}
      />

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0a0f1d] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-1.5 rounded text-[#f5f0e7]/80 hover:text-white border border-white/10 text-xs flex items-center gap-1"
            title="Firm Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded text-[#f5f0e7] border border-white/10 bg-[#0d1527] transition-colors"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation - Fit to screen height, independent scroll */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 w-64 lg:w-68 bg-[#0a0f1d] text-[#f5f0e7]/75 flex-shrink-0 flex flex-col border-r border-white/10 z-50 transition-transform duration-200 ease-in-out md:transition-none shadow-2xl md:shadow-none h-full`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#070b14]/50">
          <div className="flex items-center justify-between">
            <Link to="/app" className="block">
              <Logo size="sm" />
            </Link>
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#f5f0e7]/60 font-mono">
            Chambers & Practice Portal
          </div>
        </div>

        {/* Database & System Status Card */}
        <div className="mx-3.5 my-2.5 px-3 py-2 rounded-sm bg-[#070b14] border border-white/10 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#f5f0e7]/60 font-mono tracking-wider uppercase text-[9px]">Database Engine</span>
            <span className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MySQL 8.0</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-white/5">
            <span className="text-[#f5f0e7]/50 font-serif">Schema:</span>
            <span className="font-mono text-white text-[10px]">briefcase • InnoDB</span>
          </div>
        </div>

        {/* Section Eyebrow */}
        <div className="px-5 pt-1.5 pb-1 text-[9px] font-mono tracking-[0.2em] text-[#f5f0e7]/60 uppercase flex items-center justify-between">
          <span>Practice Modules</span>
          <button
            onClick={() => setOnboardingOpen(true)}
            className="text-[9px] text-[#f5f0e7]/70 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Re-open orientation"
          >
            <Compass className="w-3 h-3" />
            Guide
          </button>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-sm text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#121c33] text-white border-l-2 border-white shadow-sm font-medium'
                    : 'text-[#f5f0e7]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#f5f0e7]/50 group-hover:text-white'
                    }`}
                  />
                  <div className="truncate">
                    <div className={`truncate ${isActive ? 'text-white' : 'text-[#f5f0e7]/85'}`}>
                      {item.name}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[8px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30 font-medium'
                        : 'bg-[#070b14] text-[#f5f0e7]/60 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Public Website Switcher */}
        <div className="px-3 py-2 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center justify-between w-full p-2 rounded-sm bg-[#070b14] hover:bg-[#121c33] border border-white/10 text-xs text-[#f5f0e7]/80 hover:text-white transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#f5f0e7]/70 group-hover:text-white transition-colors" />
              <span className="text-[11px] font-mono">Public Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#f5f0e7]/40" />
          </Link>
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-white/10 bg-[#070b14] text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#121c33] border border-white/20 flex items-center justify-center text-white font-serif text-xs font-semibold shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'BC'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-xs truncate">
                  {user?.name || 'Managing Partner'}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono truncate">
                  {user?.role || 'Admin'} • Active
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-sm text-[#f5f0e7]/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Terminate Session (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Fit to Screen, Independent Scroll */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#070b14]">
        {/* Top Architectural Header */}
        <header className="bg-[#0a0f1d]/95 backdrop-blur-md border-b border-white/10 px-5 py-3 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-serif tracking-widest text-[#f5f0e7]/70 uppercase text-[11px] font-semibold">
              BriefCase
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white font-medium font-serif text-sm">
              {currentNav.name}
            </span>
            <span className="hidden sm:inline-block text-white/30">•</span>
            <span className="hidden sm:inline-block text-[#f5f0e7]/60 text-xs font-sans">
              {currentNav.subtitle}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs px-2.5 py-1 rounded-sm bg-[#070b14] border border-white/10 text-[#f5f0e7]/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[10px] text-white">Node.js :5000</span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-[10px] text-[#f5f0e7]">MySQL 8.0</span>
            </div>

            <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
              <span className="text-xs text-[#f5f0e7]/70 font-serif italic hidden md:inline">
                "Fiat Justitia Ruat Caelum"
              </span>
            </div>
          </div>
        </header>

        {/* Page Container - Scrollable area */}
        <main className="flex-1 p-4 sm:p-6 md:p-7 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
