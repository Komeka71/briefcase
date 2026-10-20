import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Logo from '../components/Logo';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Home
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Lawyer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        status: 'Active'
      });

      if (res.data && res.data.success) {
        localStorage.setItem('briefcase_token', res.data.token);
        localStorage.setItem('briefcase_user', JSON.stringify(res.data.user));
        setSuccessMsg('Account registered successfully. Entering practice chambers...');
        setTimeout(() => {
          navigate('/app');
        }, 600);
      } else {
        setError(res.data?.message || 'Registration failed. Please check inputs.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Unable to register user. Check database connectivity.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-[#f5f0e7] flex flex-col lg:flex-row antialiased selection:bg-[#1e293b] selection:text-white">
      {/* Left Visual Column */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-white/10 bg-[#0a0f1d]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: `url('/law_library.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#0a0f1d]/85 to-[#070b14]/90" />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <Logo size="md" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 hover:text-white transition-colors py-1.5 px-3 rounded-sm border border-white/10 hover:border-white/25 bg-[#0d1527]/70 backdrop-blur-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Firm Website</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md my-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1527] border border-white/15 text-[10px] font-mono tracking-widest text-[#f5f0e7]/80 uppercase">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span>Chambers Access Control</span>
          </div>
          <h2 className="font-serif text-3xl xl:text-4xl leading-tight text-white">
            "Every legal matter deserves structured organization and uncompromising security."
          </h2>
          <p className="text-[#f5f0e7]/70 text-xs sm:text-sm leading-relaxed font-sans">
            Admit practice advocates, assistants, and legal staff with role-based permissions and complete audit traceability.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#f5f0e7]/60 pt-4 border-t border-white/10">
          <span>Bar Council Standards</span>
          <span>Role-Based Access (RBAC)</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8 relative bg-[#070b14]">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-white/10">
            <Logo size="sm" />
            <Link to="/" className="text-xs font-mono text-[#f5f0e7]/70 hover:text-white flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
              Create Counsel Account
            </h1>
            <p className="text-xs sm:text-sm text-[#f5f0e7]/70 font-sans">
              Enroll into the BriefCase practice management system.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#1e1517] border-l-4 border-red-500 rounded-sm text-red-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#151e18] border-l-4 border-emerald-500 rounded-sm text-emerald-200 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#f5f0e7]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adv. Priya Patel"
                  className="w-full pl-10 pr-4 py-2 bg-[#0d1527] border border-white/10 rounded-sm text-xs text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#f5f0e7]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counsel@briefcase.in"
                  className="w-full pl-10 pr-4 py-2 bg-[#0d1527] border border-white/10 rounded-sm text-xs font-mono text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                  Chambers Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1527] border border-white/10 rounded-sm text-xs font-mono text-white focus:border-white focus:outline-none"
                >
                  <option value="Lawyer">Lawyer / Advocate</option>
                  <option value="Admin">Admin / Managing Partner</option>
                  <option value="Assistant">Legal Assistant</option>
                  <option value="Staff">Chambers Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-3 pr-8 py-2 bg-[#0d1527] border border-white/10 rounded-sm text-xs font-mono text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#f5f0e7]/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 bg-[#0d1527] border border-white/10 rounded-sm text-xs font-mono text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#f5f0e7] hover:bg-white text-[#070b14] rounded-sm text-xs font-mono font-medium uppercase tracking-wider transition-all duration-200 shadow-xl shadow-black/40 flex items-center justify-center space-x-2 group hover:scale-[1.01] mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#070b14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#070b14] transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-[#f5f0e7]/60">Already hold chambers credentials? </span>
              <Link to="/login" className="text-xs font-mono text-white hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
