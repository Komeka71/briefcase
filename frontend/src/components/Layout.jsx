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
  Compass,
  FolderOpen,
  CheckSquare,
  Receipt,
  Database,
  Search,
  Scale
} from 'lucide-react';
import OnboardingModal from './OnboardingModal';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
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
    { name: 'PL/SQL Lab', href: '/app/plsql', icon: Database, subtitle: 'Procedures, Cursors & Triggers', badge: 'Lab 10' },
    { name: 'Activity History', href: '/app/audit', icon: History, subtitle: 'Forensic Trigger Logs', badge: 'Audited' },
    { name: 'Security & RBAC', href: '/app/db-users', icon: ShieldCheck, subtitle: 'Stored Proc & DB Accounts', badge: 'Protected' },
  ];

  const currentNav = navigation.find(n => n.href === location.pathname) || {
    name: 'Practice Management',
    subtitle: 'Chambers Operations'
  };

  return (
    <div className="h-screen w-full bg-[#0A0A0B] text-[#F6F4EF] flex flex-col md:flex-row overflow-hidden antialiased selection:bg-[#B8975A]/30 selection:text-white">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        userName={user?.name}
      />

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#141416] border-b border-[#2B2D32] px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-1.5 rounded text-[#B4B7BC] hover:text-[#D4B97E] border border-[#2B2D32] text-xs flex items-center gap-1"
            title="Firm Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded text-[#F6F4EF] border border-[#2B2D32] bg-[#1E1F23] hover:border-[#B8975A]/50 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation - The Courtroom Black & Charcoal Gradient */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 w-64 lg:w-72 bg-gradient-to-b from-[#0A0A0B] via-[#141416] to-[#1E1F23] text-[#B4B7BC] flex-shrink-0 flex flex-col border-r border-[#2B2D32] z-50 transition-transform duration-200 ease-in-out md:transition-none shadow-2xl md:shadow-none h-full`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-[#2B2D32] bg-[#0A0A0B]/80 relative">
          <div className="flex items-center justify-between">
            <Link to="/app" className="block outline-none">
              <Logo size="sm" />
            </Link>
          </div>
          <div className="mt-1.5 text-[8.5px] uppercase tracking-[0.22em] text-[#6B6F76] font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8975A]" />
            <span>Chambers Practice Portal</span>
          </div>
          {/* Hairline Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B8975A]/30 to-transparent" />
        </div>

        {/* Database & Engine Status Card */}
        <div className="mx-3.5 my-2.5 px-3 py-2 rounded-[3px] bg-[#0A0A0B] border border-[#2B2D32] text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#6B6F76] font-mono tracking-wider uppercase text-[9px]">Relational Engine</span>
            <span className="flex items-center space-x-1.5 text-[#72C095] font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F7D5C] animate-pulse"></span>
              <span>MySQL 8.0</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-[#2B2D32]/60">
            <span className="text-[#6B6F76] font-serif">Schema:</span>
            <span className="font-mono text-[#F6F4EF] text-[10px]">briefcase • InnoDB</span>
          </div>
        </div>

        {/* Section Eyebrow */}
        <div className="px-5 pt-2 pb-1 text-[9px] font-mono tracking-[0.22em] text-[#6B6F76] uppercase flex items-center justify-between">
          <span>Courtroom Modules</span>
          <button
            onClick={() => setOnboardingOpen(true)}
            className="text-[9px] text-[#B8975A] hover:text-[#D4B97E] transition-colors flex items-center gap-1 cursor-pointer font-sans"
            title="Re-open orientation"
          >
            <Compass className="w-3 h-3" />
            Guide
          </button>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-[3px] text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1E1F23] text-white border-l-2 border-[#B8975A] shadow-[0_0_12px_rgba(184,151,90,0.18)] font-medium'
                    : 'text-[#B4B7BC] hover:text-white hover:bg-[#1E1F23]/50'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-[#D4B97E]' : 'text-[#6B6F76] group-hover:text-[#B8975A]'
                    }`}
                  />
                  <div className="truncate">
                    <div className={`truncate ${isActive ? 'text-white font-medium' : 'text-[#B4B7BC]'}`}>
                      {item.name}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[8.5px] px-1.5 py-0.5 rounded-[2px] font-mono flex-shrink-0 border ${
                      isActive
                        ? 'bg-[#B8975A]/20 text-[#D4B97E] border-[#B8975A]/40 font-medium'
                        : 'bg-[#0A0A0B] text-[#6B6F76] border-[#2B2D32]'
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
        <div className="px-3 py-2 border-t border-[#2B2D32]">
          <Link
            to="/"
            className="flex items-center justify-between w-full p-2 rounded-[3px] bg-[#0A0A0B] hover:bg-[#1E1F23] border border-[#2B2D32] hover:border-[#B8975A]/30 text-xs text-[#B4B7BC] hover:text-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#B8975A] group-hover:text-[#D4B97E] transition-colors" />
              <span className="text-[11px] font-mono">Chambers Public Site</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B6F76] group-hover:text-white transition-colors" />
          </Link>
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-[#2B2D32] bg-[#0A0A0B] text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[3px] bg-gradient-to-br from-[#1E1F23] to-[#141416] border border-[#B8975A]/40 flex items-center justify-center text-[#D4B97E] font-serif text-xs font-semibold shrink-0 shadow-sm">
                {user?.name?.slice(0, 2).toUpperCase() || 'BC'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-medium text-white text-xs truncate">
                  {user?.name || 'Managing Partner'}
                </div>
                <div className="text-[9px] text-[#72C095] font-mono truncate flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F7D5C]" />
                  <span>{user?.role || 'Admin'} • Verified</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
              title="Terminate Session (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0A0A0B]">
        {/* Top Courtroom Architectural Header */}
        <header className="bg-[#141416]/95 backdrop-blur-md border-b border-[#2B2D32] px-5 py-3 flex-shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs min-w-0">
            <span className="font-serif tracking-widest text-[#B8975A] uppercase text-[11px] font-bold shrink-0">
              BRIEFCASE
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B6F76] shrink-0" />
            <h1 className="text-white font-serif font-medium text-sm sm:text-base truncate">
              {currentNav.name}
            </h1>
            <span className="hidden sm:inline-block text-[#2B2D32]">•</span>
            <span className="hidden lg:inline-block text-[#B4B7BC] text-xs font-sans truncate">
              {currentNav.subtitle}
            </span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Quick Presentational Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-[#6B6F76] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search matter, counsel..."
                className="w-44 lg:w-56 pl-8 pr-3 py-1 bg-[#0A0A0B] border border-[#2B2D32] focus:border-[#B8975A] rounded-[3px] text-xs text-[#F6F4EF] placeholder-[#6B6F76] focus:outline-none transition-colors font-sans"
              />
            </div>

            {/* Role Badge */}
            <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-mono tracking-wide uppercase bg-[#B8975A]/15 text-[#D4B97E] border border-[#B8975A]/30">
              {user?.role || 'Admin'}
            </div>

            {/* Legal Motto */}
            <div className="hidden xl:flex items-center pl-3 border-l border-[#2B2D32]">
              <span className="text-xs text-[#B4B7BC] font-serif italic">
                &ldquo;Fiat Justitia Ruat Caelum&rdquo;
              </span>
            </div>
          </div>
        </header>

        {/* Page Container - Scrollable area */}
        <main className="flex-1 p-4 sm:p-6 md:p-7 overflow-y-auto w-full mx-auto flex flex-col justify-between">
          <div className="max-w-7xl w-full mx-auto">
            <Outlet />
          </div>

          {/* Minimal Dark Courtroom Footer */}
          <footer className="mt-12 pt-6 border-t border-[#2B2D32] text-xs text-[#6B6F76] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto font-sans">
            <div className="flex items-center space-x-2">
              <Scale className="w-3.5 h-3.5 text-[#B8975A]" />
              <span className="font-serif text-[#B4B7BC]">BriefCase</span>
              <span>•</span>
              <span>Law Firm Case Management System</span>
            </div>
            <div className="font-mono text-[11px] text-[#6B6F76]">
              BriefCase © 2026 • SVNIT CS203 DBMS Practice Chambers
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
