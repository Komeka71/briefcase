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
  KeyRound
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

  // Login test form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginResult, setLoginResult] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      // If unauthenticated or forbidden, keep empty
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
      setSuccess(`User registered successfully via Stored Procedure RegisterUser.`);
      setRegisterOpen(false);
      setRegForm({ name: '', email: '', password: '', role: 'Lawyer', status: 'Active' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await authService.login(loginForm.email, loginForm.password);
      setLoginResult(res.data);
      setSuccess('Bcrypt password verification and JWT token generation succeeded!');
      if (res.data.token) {
        localStorage.setItem('briefcase_token', res.data.token);
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      setLoginResult(null);
    }
  };

  const dbAccounts = [
    {
      account: 'briefcase_naive@localhost',
      role: 'Basic / Naive User',
      privileges: 'SELECT on CLIENT, CASES, COURT, CASE_TYPE, CASE_STATUS',
      rationale: 'Read-only access to public legal case records. Cannot execute DML (INSERT/UPDATE/DELETE) or invoke administrative stored procedures.',
      badge: 'Read-Only'
    },
    {
      account: 'briefcase_dev@localhost',
      role: 'Application Developer',
      privileges: 'SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW on briefcase.*',
      rationale: 'Permitted development actions including stored procedure and view debugging.',
      badge: 'DML + Procedures'
    },
    {
      account: 'briefcase_app@localhost',
      role: 'Node.js Backend Service Account',
      privileges: 'SELECT, INSERT, UPDATE, DELETE, EXECUTE on briefcase.*',
      rationale: 'Dedicated least-privilege runtime service account used by the Node.js API pool. Prohibits administrative DDL (DROP DATABASE, ALTER USER).',
      badge: 'Service Pool'
    },
    {
      account: 'briefcase_dba@localhost',
      role: 'Database Administrator (DBA)',
      privileges: 'ALL PRIVILEGES on briefcase.* WITH GRANT OPTION',
      rationale: 'Complete administrative oversight, schema migrations, and user privilege delegations.',
      badge: 'Superuser'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Editorial Header */}
      <div className="bg-[#141f32] border border-white/10 rounded-sm p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#c9a96e]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-[#18263d] text-[#c9a96e] border border-[#c9a96e]/30">
              Lab Assignment 10 • Req 10.2 & 10.3
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              MySQL Privileges vs Application USERS
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white tracking-tight">
            Database Privileges & <span className="italic text-[#c9a96e]">User Authentication</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-300 font-serif leading-relaxed max-w-2xl">
            Demonstrates the fundamental architectural distinction between MySQL RDBMS Accounts (GRANT matrix)
            and application-tier authenticated users stored in the USERS table with bcrypt hashing.
          </p>
        </div>

        <button
          onClick={() => setRegisterOpen(true)}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-black/30 font-mono"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Register App User (10.3)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#18263d] border-l-4 border-red-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#18263d] border-l-4 border-emerald-500 rounded-sm text-slate-200 flex items-start space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-serif">{success}</div>
        </div>
      )}

      {/* SECTION A: Requirement 10.2 - MySQL Database Accounts Matrix */}
      <div className="bg-[#141f32] rounded-sm border border-white/10 p-6 shadow-xl space-y-4">
        <div className="pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#c9a96e]" />
            <h2 className="text-base font-serif font-semibold text-white">
              Requirement 10.2: MySQL Database Accounts Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-serif mt-1">
            Database-level authorization controls created via <code className="font-mono text-[#c9a96e] bg-black/40 px-1 rounded">CREATE USER</code> and <code className="font-mono text-[#c9a96e] bg-black/40 px-1 rounded">GRANT</code> in MySQL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dbAccounts.map((acc, idx) => (
            <div key={idx} className="p-4 rounded-sm border border-white/10 bg-[#101827] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#dfbe85]">{acc.account}</span>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono bg-[#18263d] text-[#c9a96e] border border-[#c9a96e]/30">
                  {acc.badge}
                </span>
              </div>
              <div className="text-xs font-serif font-semibold text-white">{acc.role}</div>
              <div className="text-xs font-mono text-slate-300 bg-[#0a0f18] p-2.5 rounded-sm border border-white/5">
                {acc.privileges}
              </div>
              <p className="text-xs text-slate-400 font-serif">{acc.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: Requirement 10.3 - Application Users & Bcrypt Authentication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Verification Panel */}
        <div className="bg-[#141f32] rounded-sm border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <Key className="w-5 h-5 text-[#c9a96e]" />
            <h3 className="text-base font-serif font-semibold text-white">
              Test Login Verification (Procedure: GetUserByEmail)
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-serif">
            Node.js retrieves the salted hash via <code className="font-mono text-[#c9a96e] bg-black/40 px-1 rounded">GetUserByEmail(?)</code>, executes <code className="font-mono text-[#c9a96e] bg-black/40 px-1 rounded">bcrypt.compare</code>, and issues a JWT token.
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="adv.mehta@briefcase.in or admin@briefcase.in"
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Lawyer@2026 or Admin@2026"
                className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
            >
              Verify Credentials & Issue Token
            </button>
          </form>

          {loginResult && (
            <div className="p-3 bg-[#0a0f18] text-emerald-400 rounded-sm font-mono text-xs space-y-1 overflow-x-auto border border-white/10">
              <div className="font-bold text-[#dfbe85]">Authenticated Session Profile:</div>
              <div>User: {loginResult.user.name} ({loginResult.user.role})</div>
              <div>Email: {loginResult.user.email}</div>
              <div className="text-[10px] text-slate-400 truncate">JWT Token: {loginResult.token}</div>
            </div>
          )}
        </div>

        {/* Conceptual Explanation Box */}
        <div className="bg-[#18263d] border border-[#c9a96e]/30 text-white rounded-sm p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-[#dfbe85] font-serif font-bold text-sm">
              <Terminal className="w-4 h-4 text-[#c9a96e]" />
              <span>Architectural Explanation: DB vs App Users</span>
            </div>
            <div className="mt-3 text-xs text-slate-300 space-y-2.5 leading-relaxed font-serif">
              <p>
                <strong className="text-white font-sans">1. MySQL Accounts (<code className="text-[#c9a96e] font-mono">briefcase_app</code>):</strong> Manage access to the RDBMS itself. The Node.js server maintains a single connection pool authenticated via <code className="text-[#c9a96e] font-mono">briefcase_app</code>.
              </p>
              <p>
                <strong className="text-white font-sans">2. Application Users (<code className="text-[#c9a96e] font-mono">USERS table</code>):</strong> Hundreds of law firm lawyers and assistants do not each require a MySQL server login. Instead, their credentials reside in the <code className="text-[#c9a96e] font-mono">USERS</code> relational table, hashed with bcrypt (work factor 10).
              </p>
              <p>
                <strong className="text-white font-sans">3. Audit User Tracking:</strong> For database audit triggers, Node.js injects the authenticated lawyer's identity via MySQL session variable <code className="text-[#c9a96e] font-mono">SET @current_app_user = ?</code> so trigger audit records reflect the real staff member.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono border-t border-white/10 pt-3 flex items-center justify-between">
            <span>SVNIT CS203 DBMS Project</span>
            <span className="text-[#c9a96e]">Least Privilege Principle</span>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {registerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141f32] rounded-sm shadow-2xl border border-[#c9a96e]/30 max-w-md w-full">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18263d]">
              <h3 className="font-serif font-semibold text-white text-base">
                Register Application User (RegisterUser)
              </h3>
              <button onClick={() => setRegisterOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Adv. Priya Desai"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="lawyer@briefcase.in"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Password * (Hashed via bcrypt work factor 10)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Role</label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Lawyer">Lawyer</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">Status</label>
                  <select
                    value={regForm.status}
                    onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101827] border border-white/10 focus:border-[#c9a96e] rounded-sm text-xs text-white font-mono"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#c9a96e] hover:bg-[#dfbe85] text-[#101827] rounded-sm text-xs font-semibold uppercase tracking-wider shadow-lg font-mono transition-colors"
                >
                  Execute RegisterUser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
