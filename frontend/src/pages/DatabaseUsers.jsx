import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import {
  ShieldCheck,
  Key,
  Users,
  Lock,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Terminal,
  Shield,
  Layers,
  KeyRound,
  Trash2,
  Eye,
  BadgeCheck
} from 'lucide-react';

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
      // In case unauthenticated
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
      const res = await authService.register(regForm);
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
      rationale: 'Read-only access to case registry and dockets. Cannot execute DML (INSERT/UPDATE/DELETE) or invoke administrative stored procedures.',
      badge: 'Read-Only'
    },
    {
      account: 'briefcase_dev@localhost',
      role: 'Application Service Account',
      privileges: 'SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW on briefcase.*',
      rationale: 'Full execution privileges for API application server, invoking stored procedures and accessing views with encrypted connection pool.',
      badge: 'DML + Stored Procs'
    },
    {
      account: 'briefcase_admin@localhost',
      role: 'Managing Partner / DBA',
      privileges: 'ALL PRIVILEGES WITH GRANT OPTION on briefcase.*',
      rationale: 'Schema maintenance, index tuning, trigger creation, and system user management.',
      badge: 'Full DBA'
    }
  ];

  return (
    <div className="space-y-7 pb-12">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-sm bg-gradient-to-r from-[#553a28] via-[#664631] to-[#73513a] border border-white/10 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase font-semibold bg-[#4a3324] text-[#f5f0e7] border border-white/15">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Chambers Identity & RBAC Matrix</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
              User Directory, Roles & <span className="italic text-[#f5f0e7]">Access Control</span>
            </h1>

            <p className="text-xs md:text-sm text-[#f5f0e7]/75 font-serif leading-relaxed">
              Maintains authenticated legal staff profiles, Bar Council authorized roles (Admin, Lawyer, Assistant, Staff), and database-level security accounts.
            </p>
          </div>

          <button
            onClick={() => setRegisterOpen(true)}
            className="self-start md:self-auto inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-black/40 font-mono hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Create User Account</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 bg-red-950/40 border-l-4 border-red-500 rounded-sm text-[#f5f0e7] flex items-start space-x-3 shadow-lg border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif leading-relaxed">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border-l-4 border-emerald-500 rounded-sm text-[#f5f0e7] flex items-start space-x-3 shadow-lg border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif leading-relaxed">{success}</div>
        </div>
      )}

      {/* System Users Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <h2 className="text-lg font-serif font-semibold text-white">
              Authorized Practice Accounts (USERS Table)
            </h2>
          </div>
          <span className="text-xs font-mono text-[#f5f0e7]/60">
            {users.length} Active System Users
          </span>
        </div>

        <div className="bg-[#553a28] rounded-sm border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5f0e7]/75">
              <thead className="bg-[#4a3324] text-white/70 text-[11px] uppercase tracking-wider font-mono border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">User ID</th>
                  <th className="px-5 py-3.5 font-semibold">Legal Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email Identifier</th>
                  <th className="px-5 py-3.5 font-semibold">Chambers Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Admitted On</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-[#f5f0e7]/60 font-serif">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Querying authorized user directory...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-[#f5f0e7]/60 font-serif">
                      No user accounts found. Click "Create User Account" to add practice members.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-white font-bold font-mono">#{u.user_id}</td>
                      <td className="px-5 py-3.5 font-serif font-semibold text-white text-sm">
                        {u.name}
                      </td>
                      <td className="px-5 py-3.5 text-white/80">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                          u.role === 'Admin' ? 'bg-[#73513a] text-white border border-white/20' :
                          u.role === 'Lawyer' ? 'bg-[#664631] text-[#f5f0e7] border border-white/15' :
                          'bg-white/5 text-[#f5f0e7]/70'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] ${
                          u.status === 'Active' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/60">
                        {u.created_at ? String(u.created_at).slice(0, 10) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== 'Admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.user_id, u.name)}
                            className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-950/40 rounded-sm border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
                            title="Revoke Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Database Security & Least Privilege Matrix */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-white" />
          <h2 className="text-lg font-serif font-semibold text-white">
            Database Accounts & Least-Privilege Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dbAccounts.map((acc, idx) => (
            <div
              key={idx}
              className="bg-[#553a28] p-5 rounded-sm border border-white/10 shadow-xl space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-semibold text-white text-base">{acc.role}</h3>
                  <div className="text-[11px] font-mono text-[#f5f0e7]/70 mt-0.5">{acc.account}</div>
                </div>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono bg-[#73513a] text-white border border-white/20">
                  {acc.badge}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60">Grant Privileges:</div>
                  <code className="text-xs font-mono text-emerald-400 block mt-0.5 bg-[#4a3324] p-2 rounded-sm border border-white/10">
                    {acc.privileges}
                  </code>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-[#f5f0e7]/60">Security Rationale:</div>
                  <p className="font-serif text-[#f5f0e7]/75 text-xs leading-relaxed mt-0.5">
                    {acc.rationale}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      {registerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#553a28] rounded-sm shadow-2xl border border-white/20 max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#4a3324]">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-white" />
                <h3 className="font-serif font-semibold text-white text-base">
                  Register System User Account
                </h3>
              </div>
              <button
                onClick={() => setRegisterOpen(false)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. Priya Patel"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#4a3324] border border-white/15 focus:border-white rounded-sm text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@briefcase.law"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#4a3324] border border-white/15 focus:border-white rounded-sm text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1.5">
                  Password (Bcrypt Hashed) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#4a3324] border border-white/15 focus:border-white rounded-sm text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1.5">
                    Chambers Role *
                  </label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#4a3324] border border-white/15 focus:border-white rounded-sm text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="Lawyer">Lawyer</option>
                    <option value="Admin">Admin</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={regForm.status}
                    onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#4a3324] border border-white/15 focus:border-white rounded-sm text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="px-4 py-2 border border-white/15 text-white/70 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-sm text-xs font-semibold uppercase tracking-wider shadow font-mono transition-colors cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
