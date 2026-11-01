import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Terminal,
  Trash2,
  Lock,
  Mail,
  User
} from 'lucide-react';
import { PageHeader, StatusPill, Skeleton, EmptyState } from '../components/ui';

export default function DatabaseUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Registration modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Lawyer',
    status: 'Active'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      console.warn('Could not load users list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await authService.register(regForm);
      setSuccess(`User "${regForm.name}" registered successfully with role ${regForm.role}.`);
      setRegisterOpen(false);
      setRegForm({ name: '', email: '', password: '', role: 'Lawyer', status: 'Active' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Revoke account access for "${name}" (ID #${id})?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await authService.deleteUser(id);
      setSuccess(`User #${id} successfully removed from practice authorization system.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove user account.');
    }
  };

  const dbAccounts = [
    {
      account: 'briefcase_naive@localhost',
      role: 'Staff / Read-Only Inquirer',
      privileges: 'SELECT on CLIENT, CASES, COURT, CASE_TYPE, CASE_STATUS',
      rationale:
        'Read-only access to case registry and dockets. Cannot execute DML (INSERT/UPDATE/DELETE) or invoke administrative stored procedures.',
      badge: 'Read-Only'
    },
    {
      account: 'briefcase_dev@localhost',
      role: 'Application Service Account',
      privileges: 'SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW on briefcase.*',
      rationale:
        'Full execution privileges for API application server, invoking stored procedures and accessing views with encrypted connection pool.',
      badge: 'DML + Stored Procs'
    },
    {
      account: 'briefcase_admin@localhost',
      role: 'Managing Partner / DBA',
      privileges: 'ALL PRIVILEGES WITH GRANT OPTION on briefcase.*',
      rationale:
        'Schema maintenance, index tuning, trigger creation, and system user management.',
      badge: 'Full DBA'
    }
  ];

  const getRoleVariant = (role = '') => {
    if (role === 'Admin') return 'danger';
    if (role === 'Lawyer') return 'warning';
    if (role === 'Assistant') return 'info';
    return 'neutral';
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Chambers Identity & RBAC Matrix • Security Architecture"
        title="Security, Roles & Access Control"
        subtitle="Maintains authenticated legal staff profiles, Bar Council authorized roles (Admin, Lawyer, Assistant, Staff), and database-level security accounts."
        actions={
          <button
            onClick={() => setRegisterOpen(true)}
            className="court-btn-brass px-4 py-2 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-ink-950" />
            <span>Create User Account</span>
          </button>
        }
      />

      {/* Alert Banners */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 bg-red-950/30 border border-red-500/40 rounded text-red-300 text-xs flex items-start gap-2.5 font-mono"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded text-emerald-300 text-xs flex items-start gap-2.5 font-mono"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">{success}</div>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authorized Practice Accounts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-brass-500/15 border border-brass-500/30 flex items-center justify-center text-brass-400">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-ivory-100">
              Authorized Practice Accounts (USERS Table)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-graphite-400">
            <strong className="text-ivory-100">{users.length}</strong> Registered Personnel
          </span>
        </div>

        <div className="court-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="court-table w-full">
              <thead>
                <tr>
                  <th className="w-20">User ID</th>
                  <th>Full Name</th>
                  <th>Chambers Email</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Enrolled Timestamp</th>
                  <th className="text-right">Revoke Access</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="py-3 px-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <EmptyState
                        icon={Users}
                        title="No User Accounts Registered"
                        description="Click 'Create User Account' to provision access credentials for advocates, associates, or partners."
                        actionLabel="Add First Account"
                        onAction={() => setRegisterOpen(true)}
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="font-mono text-xs font-bold text-brass-300">
                        #{u.user_id}
                      </td>
                      <td className="font-serif font-medium text-ivory-100 text-sm">
                        {u.name}
                      </td>
                      <td className="font-mono text-xs text-graphite-300">
                        {u.email}
                      </td>
                      <td>
                        <StatusPill
                          status={u.role}
                          variant={getRoleVariant(u.role)}
                          size="sm"
                        />
                      </td>
                      <td>
                        <StatusPill
                          status={u.status || 'Active'}
                          variant={u.status === 'Inactive' ? 'danger' : 'success'}
                          size="sm"
                        />
                      </td>
                      <td className="font-mono text-xs text-graphite-400">
                        {u.created_at ? String(u.created_at).slice(0, 19).replace('T', ' ') : '—'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteUser(u.user_id, u.name)}
                          className="p-1.5 rounded text-graphite-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                          title="Revoke User Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Database-Level Security Accounts Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-brass-500/15 border border-brass-500/30 flex items-center justify-center text-brass-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-ivory-100">
              Database Accounts & Role Access Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono text-graphite-400">
            3 Isolated Database Roles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dbAccounts.map((acc) => (
            <div
              key={acc.account}
              className="court-card p-5 space-y-4 flex flex-col justify-between group hover:border-brass-500/40 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-brass-300 truncate">
                    {acc.account}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-brass-500/15 border border-brass-500/30 text-brass-300 shrink-0 font-semibold">
                    {acc.badge}
                  </span>
                </div>

                <div className="font-serif font-medium text-ivory-100 text-sm">
                  {acc.role}
                </div>

                <div className="p-3 bg-ink-950 border border-brass-500/20 rounded font-mono text-[11px] text-emerald-300/90 leading-relaxed shadow-inner">
                  {acc.privileges}
                </div>

                <p className="text-xs text-graphite-300 leading-relaxed font-sans">
                  {acc.rationale}
                </p>
              </div>

              <div className="pt-3 border-t border-brass-500/15 flex items-center justify-between text-[10px] font-mono text-graphite-400">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-brass-500/60" />
                  Host: localhost
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active Enforcement
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {registerOpen && (
          <div className="fixed inset-0 bg-ink-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="court-card max-w-lg w-full border border-brass-500/30 shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-brass-500/20 flex items-center justify-between bg-charcoal-900">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-brass-500/15 border border-brass-500/30 flex items-center justify-center text-brass-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-semibold text-ivory-100 text-sm">
                    Register Authorized Personnel Account
                  </h3>
                </div>
                <button
                  onClick={() => setRegisterOpen(false)}
                  className="p-1 rounded text-graphite-400 hover:text-ivory-100 hover:bg-charcoal-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-300 mb-1.5">
                    Full Name & Salutation *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="e.g. Adv. Meera Joshi"
                      className="w-full pl-9 pr-3 py-2 court-input text-xs text-ivory-100 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-300 mb-1.5">
                    Chambers Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="m.joshi@briefcase.in"
                      className="w-full pl-9 pr-3 py-2 court-input text-xs font-mono text-ivory-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-300 mb-1.5">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 court-input text-xs font-mono text-ivory-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-300 mb-1.5">
                      Authorization Role
                    </label>
                    <select
                      value={regForm.role}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      className="w-full px-3 py-2 court-input text-xs font-mono text-ivory-100 bg-charcoal-900 border border-brass-500/20 rounded cursor-pointer"
                    >
                      <option value="Lawyer" className="bg-charcoal-900">Lawyer / Advocate</option>
                      <option value="Admin" className="bg-charcoal-900">Admin / Chambers Partner</option>
                      <option value="Assistant" className="bg-charcoal-900">Legal Assistant / Paralegal</option>
                      <option value="Staff" className="bg-charcoal-900">Clerical Staff / Clerk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-300 mb-1.5">
                      Account Status
                    </label>
                    <select
                      value={regForm.status}
                      onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                      className="w-full px-3 py-2 court-input text-xs font-mono text-ivory-100 bg-charcoal-900 border border-brass-500/20 rounded cursor-pointer"
                    >
                      <option value="Active" className="bg-charcoal-900">Active / Verified</option>
                      <option value="Inactive" className="bg-charcoal-900">Suspended / Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2.5 border-t border-brass-500/15">
                  <button
                    type="button"
                    onClick={() => setRegisterOpen(false)}
                    className="court-btn-outline px-4 py-2 rounded text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="court-btn-brass px-5 py-2 rounded text-xs font-mono font-semibold uppercase tracking-wider shadow cursor-pointer"
                  >
                    Register Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
