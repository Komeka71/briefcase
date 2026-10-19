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
  Terminal
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Lab Assignment 10 • Req 10.2 & 10.3
            </span>
            <span className="text-xs text-slate-500 font-mono">MySQL Privileges vs Application USERS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Database Privileges & User Authentication</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Illustrates the critical architectural distinction between MySQL Database Accounts and Application Login Users.
          </p>
        </div>

        <button
          onClick={() => setRegisterOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register App User (Req 10.3)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-start space-x-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      {/* SECTION A: Requirement 10.2 - MySQL Database Accounts Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Requirement 10.2: MySQL Database Accounts Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Database-level authorization controls created via <code className="font-mono bg-slate-100 px-1 rounded">CREATE USER</code> and <code className="font-mono bg-slate-100 px-1 rounded">GRANT</code> in MySQL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dbAccounts.map((acc, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">{acc.account}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  {acc.badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-700">{acc.role}</div>
              <div className="text-xs font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                {acc.privileges}
              </div>
              <p className="text-xs text-slate-500">{acc.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: Requirement 10.3 - Application Users & Bcrypt Authentication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Verification Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Test Login Verification (Procedure: GetUserByEmail)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Node.js retrieves the salted hash via <code className="font-mono bg-slate-100 px-1 rounded">GetUserByEmail(?)</code>, executes <code className="font-mono bg-slate-100 px-1 rounded">bcrypt.compare</code>, and issues a JWT token.
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="adv.mehta@briefcase.in or admin@briefcase.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Lawyer@2026 or Admin@2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Verify Credentials & Issue Token
            </button>
          </form>

          {loginResult && (
            <div className="p-3 bg-slate-950 text-emerald-400 rounded-lg font-mono text-xs space-y-1 overflow-x-auto">
              <div className="font-bold text-amber-300">Authenticated Session Profile:</div>
              <div>User: {loginResult.user.name} ({loginResult.user.role})</div>
              <div>Email: {loginResult.user.email}</div>
              <div className="text-[10px] text-slate-400 truncate">Token: {loginResult.token}</div>
            </div>
          )}
        </div>

        {/* Conceptual Explanation Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>Architectural Explanation: DB vs App Users</span>
            </div>
            <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>1. MySQL Accounts (<code className="text-amber-300">briefcase_app</code>):</strong> Manage access to the RDBMS itself. The Node.js server maintains a single connection pool authenticated via <code className="text-amber-300">briefcase_app</code>.
              </p>
              <p>
                <strong>2. Application Users (<code className="text-amber-300">USERS table</code>):</strong> Hundreds of law firm lawyers and assistants do not each require a MySQL server login. Instead, their credentials reside in the <code className="text-amber-300">USERS</code> relational table, hashed with bcrypt (work factor 10).
              </p>
              <p>
                <strong>3. Audit User Tracking:</strong> For database audit triggers, Node.js injects the authenticated lawyer's identity via MySQL session variable <code className="text-amber-300">SET @current_app_user = ?</code> so trigger audit records reflect the real staff member.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-3">
            SVNIT CS203 • Demonstrates Principle of Least Privilege
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {registerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Register Application User (RegisterUser)</h3>
              <button onClick={() => setRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Adv. Priya Desai"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="lawyer@briefcase.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password * (Will be hashed via bcrypt)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Lawyer">Lawyer</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={regForm.status}
                    onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
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
