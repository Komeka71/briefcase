import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import {
  ShieldCheck,
  Key,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Terminal,
  Shield,
  Trash2,
  Scale
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

  const getRoleBadgeClass = (role = '') => {
    if (role === 'Admin') return 'badge-danger';
    if (role === 'Lawyer') return 'badge-warning';
    if (role === 'Assistant') return 'badge-info';
    return 'badge-success';
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Chambers Identity & RBAC Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            Security, Roles & Access Control
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            Maintains authenticated legal staff profiles, Bar Council authorized roles (Admin, Lawyer, Assistant, Staff), and database-level security accounts.
          </p>
        </div>

        <button
          onClick={() => setRegisterOpen(true)}
          className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <UserPlus className="w-4 h-4 text-[#0A0A0B]" />
          <span>Create User Account</span>
        </button>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-3.5 bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 rounded-[3px] text-[#E67272] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-[#3F7D5C]/20 border border-[#3F7D5C]/60 rounded-[3px] text-[#72C095] text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Authorized Practice Accounts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#B8975A]" />
            <h3 className="text-sm font-serif font-semibold text-white">
              Authorized Practice Accounts (USERS Table)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#6B6F76]">
            {users.length} Registered Accounts
          </span>
        </div>

        <div className="court-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="court-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Chambers Email</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Enrolled Timestamp</th>
                  <th className="text-right">Revoke Access</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs font-mono text-[#B4B7BC]">
                      Querying authorized users from database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs font-serif text-[#6B6F76]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-[#B8975A]/40" />
                        <p>No user accounts returned from directory query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id}>
                      <td className="font-mono text-xs font-bold text-[#D4B97E]">
                        #{u.user_id}
                      </td>
                      <td className="font-serif font-medium text-white text-xs">
                        {u.name}
                      </td>
                      <td className="font-mono text-xs text-[#F6F4EF]">
                        {u.email}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${getRoleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[9px] uppercase ${
                          u.status === 'Active' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#6B6F76]">
                        {u.created_at ? String(u.created_at).slice(0, 19).replace('T', ' ') : '—'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteUser(u.user_id, u.name)}
                          className="p-1.5 rounded-[3px] text-[#6B6F76] hover:text-[#E67272] hover:bg-[#9B2C2C]/10 transition-colors cursor-pointer"
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

      {/* Database-Level Security Accounts & SQL Grants Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#B8975A]" />
            <h3 className="text-sm font-serif font-semibold text-white">
              MySQL Database Accounts & Privileges (Lab 10.2 GRANT Specifications)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#6B6F76]">
            3 Configured DB Roles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {dbAccounts.map((acc) => (
            <div key={acc.account} className="court-card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-[#D4B97E] truncate">
                    {acc.account}
                  </div>
                  <span className="px-2 py-0.5 rounded-[2px] text-[8.5px] font-mono uppercase badge-info shrink-0">
                    {acc.badge}
                  </span>
                </div>

                <div className="font-serif font-medium text-white text-xs">
                  {acc.role}
                </div>

                <div className="p-2.5 bg-[#0A0A0B] border border-[#2B2D32] rounded-[3px] font-mono text-[10.5px] text-[#72C095] leading-relaxed">
                  {acc.privileges}
                </div>

                <p className="text-xs text-[#B4B7BC] font-sans leading-relaxed">
                  {acc.rationale}
                </p>
              </div>

              <div className="pt-2 border-t border-[#2B2D32] flex items-center justify-between text-[10px] font-mono text-[#6B6F76]">
                <span>Host: localhost</span>
                <span className="text-[#3F7D5C] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F7D5C]" /> Enforced
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      {registerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="court-card-elevated max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#B8975A]" />
                <h3 className="font-serif font-semibold text-white text-sm">
                  Register Authorized Personnel Account
                </h3>
              </div>
              <button
                onClick={() => setRegisterOpen(false)}
                className="text-[#6B6F76] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Full Name & Salutation *
                </label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Adv. Meera Joshi"
                  className="w-full px-3 py-1.5 court-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Chambers Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="m.joshi@briefcase.in"
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Initial Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Authorization Role
                  </label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    <option value="Lawyer" className="bg-[#141416]">Lawyer / Advocate</option>
                    <option value="Admin" className="bg-[#141416]">Admin / Chambers Partner</option>
                    <option value="Assistant" className="bg-[#141416]">Legal Assistant / Paralegal</option>
                    <option value="Staff" className="bg-[#141416]">Clerical Staff / Clerk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                    Account Status
                  </label>
                  <select
                    value={regForm.status}
                    onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 court-input text-xs font-mono text-white"
                  >
                    <option value="Active" className="bg-[#141416]">Active / Verified</option>
                    <option value="Inactive" className="bg-[#141416]">Suspended / Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-[#2B2D32]">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="court-btn-outline px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="court-btn-brass px-5 py-1.5 rounded-[3px] text-xs font-mono font-semibold uppercase tracking-wider shadow"
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
