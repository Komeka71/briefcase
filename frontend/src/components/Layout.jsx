import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Scale,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import OnboardingModal from './OnboardingModal';
import { pageTransition } from '../lib/motion';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user from localStorage
  const [user] = useState(() => {
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

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('briefcase_token');
    localStorage.removeItem('briefcase_user');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard, subtitle: 'Practice Metrics & Dockets' },
    { name: 'Clients Registry', href: '/app/clients', icon: Users, subtitle: 'Client Directory & Records' },
    { name: 'Legal Cases', href: '/app/cases', icon: BriefcaseIcon, subtitle: 'Matter Dockets & Budgets' },
    { name: 'Chambers Counsel', href: '/app/lawyers', icon: UserCheck, subtitle: 'Advocates & Departments' },
    { name: 'Court Hearings', href: '/app/hearings', icon: Calendar, subtitle: 'Cause Lists & Bench Orders' },
    { name: 'Document Vault', href: '/app/documents', icon: FolderOpen, subtitle: 'Exhibits & Pleading Briefs' },
    { name: 'Action Items', href: '/app/tasks', icon: CheckSquare, subtitle: 'Deadlines & Trial Prep' },
    { name: 'Billing & Ledgers', href: '/app/finances', icon: Receipt, subtitle: 'Retainers & Fee Receipts' },
    { name: 'Reports', href: '/app/reports', icon: FileCode2, subtitle: 'Cross-Entity Reports & Views' },
    { name: 'System Operations', href: '/app/plsql', icon: Database, subtitle: 'Automated Procedures & Routines' },
    { name: 'Activity History', href: '/app/audit', icon: History, subtitle: 'Audit Logs & System Activity' },
    { name: 'Security & Access', href: '/app/db-users', icon: ShieldCheck, subtitle: 'User Accounts & Privileges' },
  ];

  const currentNav = navigation.find(n => n.href === location.pathname) || {
    name: 'Practice Management',
    subtitle: 'Chambers Operations'
  };

  return (
    <div className="h-screen w-full bg-ink text-ivory flex flex-col md:flex-row overflow-hidden antialiased selection:bg-brass/30 selection:text-white pinstripe-dark">
      {/* Subtle Grain */}
      <div className="film-grain" />

      {/* Onboarding Orientation Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        userName={user?.name}
      />

      {/* Mobile Top Header */}
      <div className="md:hidden bg-charcoal/95 border-b border-brass/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-1.5 rounded-xs text-silver hover:text-brass border border-slate/50 text-xs flex items-center gap-1"
            title="Firm Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xs text-ivory border border-brass/20 bg-graphite hover:border-brass/50 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          collapsed ? 'md:w-20' : 'md:w-64 lg:w-72'
        } fixed md:static inset-y-0 left-0 bg-charcoal/95 text-silver flex-shrink-0 flex flex-col border-r border-brass/15 z-50 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none h-full backdrop-blur-xl`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-brass/15 bg-charcoal relative flex items-center justify-between">
          {!collapsed ? (
            <Link to="/app" className="block outline-none">
              <Logo size="sm" />
            </Link>
          ) : (
            <Link to="/app" className="mx-auto block outline-none">
              <div className="w-8 h-8 rounded-xs bg-gradient-to-br from-graphite to-ink border border-brass/40 flex items-center justify-center text-brass font-display font-bold text-sm">
                BC
              </div>
            </Link>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1 rounded-xs text-steel hover:text-brass transition-colors cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Bottom Hairline */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brass/25 to-transparent" />
        </div>

        {/* Database & Engine Status Card (Hidden when collapsed) */}
        {!collapsed && (
          <div className="mx-3.5 my-2.5 px-3 py-2 rounded-xs bg-graphite/60 border border-brass/15 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-silver/60 font-mono tracking-wider uppercase text-[9px]">Relational Schema</span>
              <span className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>MySQL 8.0</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate/40">
              <span className="text-silver/60 font-sans">Database:</span>
              <span className="font-mono text-ivory text-[10px]">briefcase • InnoDB</span>
            </div>
          </div>
        )}

        {/* Section Header */}
        {!collapsed && (
          <div className="px-5 pt-2 pb-1 text-[9.5px] font-mono tracking-[0.2em] text-silver/50 uppercase flex items-center justify-between">
            <span>Chambers Modules</span>
            <button
              onClick={() => setOnboardingOpen(true)}
              className="text-[9.5px] text-brass hover:text-brass-light transition-colors flex items-center gap-1 cursor-pointer font-sans"
              title="Re-open orientation"
            >
              <Compass className="w-3 h-3" />
              Guide
            </button>
          </div>
        )}

        {/* Navigation Links with Sliding Active Indicator */}
        <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`group relative flex items-center ${
                  collapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 rounded-xs text-xs transition-colors duration-150 ${
                  isActive
                    ? 'text-ivory font-medium'
                    : 'text-silver/70 hover:text-ivory hover:bg-graphite/40'
                }`}
              >
                {/* Framer Motion Sliding Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-graphite border-l-2 border-brass rounded-xs shadow-[0_0_12px_rgba(184,151,90,0.12)] -z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-brass' : 'text-steel group-hover:text-brass'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">
                      {item.name}
                    </span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`relative z-10 text-[8.5px] px-1.5 py-0.5 rounded-xs font-mono shrink-0 border ${
                      isActive
                        ? 'bg-brass/15 text-brass border-brass/30 font-medium'
                        : 'bg-graphite/70 text-silver/60 border-slate/50'
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
        {!collapsed && (
          <div className="px-3 py-2 border-t border-brass/15">
            <Link
              to="/"
              className="flex items-center justify-between w-full p-2 rounded-xs bg-graphite/50 hover:bg-graphite border border-brass/15 hover:border-brass/30 text-xs text-silver hover:text-ivory transition-all group"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-brass group-hover:text-brass-light transition-colors" />
                <span className="text-[11px] font-mono">Firm Public Website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-steel group-hover:text-ivory transition-colors" />
            </Link>
          </div>
        )}

        {/* User Session Footer */}
        <div className="p-3 border-t border-brass/15 bg-charcoal text-xs">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xs bg-gradient-to-br from-graphite to-ink border border-brass/40 flex items-center justify-center text-brass font-serif text-xs font-semibold shrink-0 shadow-sm">
                {user?.name?.slice(0, 2).toUpperCase() || 'BC'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-medium text-ivory text-xs truncate">
                    {user?.name || 'Managing Partner'}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono truncate flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{user?.role || 'Admin'} • Verified</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xs text-steel hover:text-red-400 hover:bg-court-danger/20 transition-colors cursor-pointer"
                title="Terminate Session (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-ink">
        {/* Top Courtroom Header Bar */}
        <header className="bg-charcoal/90 backdrop-blur-xl border-b border-brass/15 px-5 py-3 shrink-0 flex items-center justify-between gap-4">
          {/* Breadcrumb Info */}
          <div className="flex items-center space-x-2 text-xs min-w-0">
            <span className="font-display tracking-widest text-brass uppercase text-[11px] font-semibold shrink-0">
              BRIEFCASE
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-steel shrink-0" />
            <h1 className="text-ivory font-serif font-medium text-sm sm:text-base truncate">
              {currentNav.name}
            </h1>
            <span className="hidden sm:inline-block text-steel/60">•</span>
            <span className="hidden lg:inline-block text-silver/70 text-xs font-light truncate">
              {currentNav.subtitle}
            </span>
          </div>

          {/* Right Action & Search Area */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Global Search with Command Palette Styling & Ctrl+K */}
            <div className="hidden sm:flex items-center relative group">
              <Search className="w-3.5 h-3.5 text-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-brass transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search matter, party, court..."
                className="w-48 lg:w-64 pl-9 pr-14 py-1.5 court-input text-xs font-sans"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-xs bg-slate/60 text-silver/60 text-[9px] font-mono border border-slate pointer-events-none">
                ⌘K
              </span>
            </div>

            {/* Role Badge */}
            <div className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-xs text-[10px] font-mono tracking-wider uppercase bg-brass/10 text-brass border border-brass/25">
              {user?.role || 'Admin'}
            </div>

            {/* Chambers Latin Motto */}
            <div className="hidden xl:flex items-center pl-3 border-l border-brass/15">
              <span className="text-xs text-silver/60 font-serif italic">
                &ldquo;Fiat Justitia Ruat Caelum&rdquo;
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Outlet with Soft Fade + 12px Rise Route Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full mx-auto flex flex-col justify-between">
          <div className="max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimal Dark Courtroom Footer */}
          <footer className="mt-12 pt-6 border-t border-brass/15 text-xs text-silver/60 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto font-sans">
            <div className="flex items-center space-x-2">
              <Scale className="w-3.5 h-3.5 text-brass" />
              <span className="font-serif text-silver">BriefCase Chambers</span>
              <span>•</span>
              <span>Law Firm Case Management System</span>
            </div>
            <div className="font-mono text-[11px] text-silver/50">
              BriefCase © 2026 • Chambers Practice Management
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
