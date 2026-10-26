import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Logo from '../components/Logo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Home,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authService.login(email.trim(), password);
      if (res.data && res.data.success) {
        localStorage.setItem('briefcase_token', res.data.token);
        localStorage.setItem('briefcase_user', JSON.stringify(res.data.user));
        setSuccessMsg('Authentication verified. Accessing Practice Portal...');
        setTimeout(() => {
          navigate('/app');
        }, 500);
      } else {
        setError(res.data?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Unable to connect to the authentication service. Check server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@briefcase.in');
    setPassword('Admin@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#3f2b1e] text-[#f5f0e7] flex flex-col lg:flex-row antialiased selection:bg-[#7d5a41] selection:text-white">
      {/* Left Column: Visual & Brand Authority */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-white/10 bg-[#5e412d]">
        {/* Background Image with Deep Midnight Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: `url('/legal_desk.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3f2b1e] via-[#5e412d]/85 to-[#3f2b1e]/90" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <Logo size="md" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/70 hover:text-white transition-colors py-1.5 px-3 rounded-sm border border-white/10 hover:border-white/25 bg-[#664631]/70 backdrop-blur-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Firm Website</span>
          </Link>
        </div>

        {/* Center Editorial Statement */}
        <div className="relative z-10 max-w-md my-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#664631] border border-white/15 text-[10px] font-mono tracking-widest text-[#f5f0e7]/80 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Encrypted Chambers Portal</span>
          </div>
          <div className="bc-ornament max-w-xs">§</div>
          <h2 className="font-serif text-3xl xl:text-4xl leading-tight text-white">
            <span className="gold-text-gradient">&ldquo;</span>Rigorous counsel demands an equally <span className="italic gold-text-gradient">uncompromising</span> digital practice.<span className="gold-text-gradient">&rdquo;</span>
          </h2>
          <p className="text-[#f5f0e7]/70 text-xs sm:text-sm leading-relaxed font-sans">
            Centralized legal case dockets, confidential client vaults, judicial cause lists, and transactional accounting in a single unified interface.
          </p>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#f5f0e7]/60 pt-4 border-t border-white/10">
          <span>End-to-End SSL Enforced</span>
          <span>Bcrypt • JWT Authorization</span>
        </div>
      </div>

      {/* Right Column: Sleek Fit-to-Screen Login Form */}
      <div className="bc-cream w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 relative bg-[#3f2b1e]">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Top Brand */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-white/10">
            <Logo size="sm" />
            <Link to="/" className="text-xs font-mono text-[#f5f0e7]/70 hover:text-white flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
              Client Portal Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#f5f0e7]/70 font-sans">
              Enter your credentials to access your chambers portfolio.
            </p>
          </div>

          {/* Demonstration Quick Fill Banner */}
          <div className="p-3 bg-[#664631] border border-white/15 rounded-sm flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-[#f5f0e7]/70 uppercase tracking-wider">Demo Managing Partner</div>
              <div className="font-mono text-white text-xs">admin@briefcase.in • Admin@2026</div>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className="px-2.5 py-1.5 rounded-sm bg-[#73513a] hover:bg-[#866249] text-white border border-white/20 text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#f5f0e7]" />
              <span>Fill</span>
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="p-3 bg-[#5c3030] border-l-4 border-red-500 rounded-sm text-red-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#2f4a35] border-l-4 border-emerald-500 rounded-sm text-emerald-200 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#f5f0e7]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@briefcase.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#664631] border border-white/10 rounded-sm text-xs font-mono text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/75">
                  Password
                </label>
                <span className="text-[11px] text-[#f5f0e7]/50 font-mono">Bcrypt Secured</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#f5f0e7]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#664631] border border-white/10 rounded-sm text-xs font-mono text-white placeholder-[#f5f0e7]/30 focus:border-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f0e7]/40 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-[#f5f0e7]/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#664631] border-white/20 text-[#3b2a1f] focus:ring-white"
                />
                <span>Remember this terminal</span>
              </label>
              <Link to="/register" className="text-white hover:underline font-mono text-[11px]">
                Create Counsel Account
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-b from-[#fbf5ec] to-[#e9d6b8] hover:from-[#ffffff] hover:to-[#f0e2c9] shadow-[0_8px_22px_-8px_rgba(20,12,6,0.6)] text-[#3b2a1f] rounded-sm text-xs font-mono font-medium uppercase tracking-wider transition-all duration-200 shadow-xl shadow-black/40 flex items-center justify-center space-x-2 group hover:scale-[1.01]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#3f2b1e] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Practice Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#3b2a1f] transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="text-center pt-2">
            <p className="text-[11px] font-sans text-[#f5f0e7]/50">
              Privileged access strictly reserved for authorized chambers counsel, staff, and enrolled clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
