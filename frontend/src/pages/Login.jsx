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
  Sparkles,
  Scale
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
        setSuccessMsg('Authentication verified. Entering practice chambers...');
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
    <div className="min-h-screen w-full bg-[#0A0A0B] text-[#F6F4EF] flex flex-col lg:flex-row antialiased selection:bg-[#B8975A]/30 selection:text-white">
      {/* Left Column: The Courtroom & Judicial Authority */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-[#2B2D32] bg-gradient-to-br from-[#000000] via-[#141416] to-[#1E1F23]">
        {/* Tailored Pinstripes Texture */}
        <div className="absolute inset-0 pinstripe-dark opacity-60 pointer-events-none" />

        {/* Ambient Warm Brass Radial Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#B8975A]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center outline-none">
            <Logo size="md" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#B4B7BC] hover:text-[#D4B97E] transition-colors py-1.5 px-3 rounded-[3px] border border-[#2B2D32] hover:border-[#B8975A]/40 bg-[#141416]/80 backdrop-blur-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Firm Website</span>
          </Link>
        </div>

        {/* Center Editorial Statement & Classical Courthouse Art */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-[#141416] border border-[#B8975A]/30 text-[10px] font-mono tracking-widest text-[#D4B97E] uppercase shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B8975A]" />
            <span>Encrypted Chambers Portal</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl leading-tight text-white font-medium">
            &ldquo;Rigorous counsel demands an equally{' '}
            <span className="italic brass-text-gradient font-normal">uncompromising</span> digital practice.&rdquo;
          </h2>

          <p className="text-[#B4B7BC] text-xs sm:text-sm leading-relaxed font-sans">
            Centralized legal case dockets, confidential client records, judicial cause lists, and forensic transaction ledgers in an authoritative interface.
          </p>

          {/* Courthouse Columns & Scales Decorative Architectural SVG */}
          <div className="pt-2">
            <svg
              viewBox="0 0 460 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-sm text-[#B8975A]/35"
            >
              {/* Pediment / Triangular Gable */}
              <polygon points="230,8 40,42 420,42" stroke="currentColor" strokeWidth="1.5" fill="rgba(184, 151, 90, 0.03)" />
              <polygon points="230,16 65,42 395,42" stroke="currentColor" strokeWidth="0.8" />
              
              {/* Entablature */}
              <rect x="35" y="42" width="390" height="8" stroke="currentColor" strokeWidth="1.2" fill="rgba(30, 31, 35, 0.4)" />
              <line x1="35" y1="46" x2="425" y2="46" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
              
              {/* Classical Columns (8 fluted columns) */}
              {[60, 105, 150, 195, 265, 310, 355, 400].map((x) => (
                <g key={x}>
                  {/* Capital */}
                  <rect x={x - 10} y="50" width="20" height="5" stroke="currentColor" strokeWidth="1" fill="rgba(184, 151, 90, 0.08)" />
                  {/* Column Shaft */}
                  <line x1={x - 6} y1="55" x2={x - 6} y2="120" stroke="currentColor" strokeWidth="1" />
                  <line x1={x - 2} y1="55" x2={x - 2} y2="120" stroke="currentColor" strokeWidth="0.8" />
                  <line x1={x + 2} y1="55" x2={x + 2} y2="120" stroke="currentColor" strokeWidth="0.8" />
                  <line x1={x + 6} y1="55" x2={x + 6} y2="120" stroke="currentColor" strokeWidth="1" />
                  {/* Base Plinth */}
                  <rect x={x - 10} y="120" width="20" height="6" stroke="currentColor" strokeWidth="1" fill="rgba(184, 151, 90, 0.08)" />
                </g>
              ))}

              {/* Central Scales in Arch */}
              <path d="M210 120V80C210 66 250 66 250 80V120" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="230" cy="74" r="2.5" fill="#B8975A" />
              <line x1="218" y1="82" x2="242" y2="82" stroke="currentColor" strokeWidth="1.2" />
              <path d="M218 82L213 94H223L218 82" stroke="currentColor" strokeWidth="0.8" fill="rgba(184, 151, 90, 0.15)" />
              <path d="M242 82L237 94H247L242 82" stroke="currentColor" strokeWidth="0.8" fill="rgba(184, 151, 90, 0.15)" />

              {/* Stylobate / Steps */}
              <rect x="25" y="126" width="410" height="6" stroke="currentColor" strokeWidth="1.2" fill="rgba(20, 20, 22, 0.6)" />
              <rect x="15" y="132" width="430" height="6" stroke="currentColor" strokeWidth="1.2" fill="rgba(10, 10, 11, 0.8)" />
            </svg>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#6B6F76] pt-4 border-t border-[#2B2D32]">
          <span>End-to-End SSL Enforced</span>
          <span>Bcrypt • Role-Based Access Control</span>
        </div>
      </div>

      {/* Right Column: Courtroom Login Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 relative bg-[#0A0A0B] pinstripe-charcoal">
        <div className="max-w-md w-full mx-auto space-y-6 animate-fadeIn">
          {/* Mobile Top Brand */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#2B2D32]">
            <Logo size="sm" />
            <Link to="/" className="text-xs font-mono text-[#B4B7BC] hover:text-[#D4B97E] flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A]">
              Chambers Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight font-semibold">
              Counsel Portal Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#B4B7BC] font-sans">
              Enter authorized credentials to access your chambers portfolio.
            </p>
          </div>

          {/* Demonstration Quick Fill Banner */}
          <div className="p-3.5 bg-[#141416] border border-[#B8975A]/25 rounded-[3px] flex items-center justify-between gap-3 text-xs shadow-md">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-[#D4B97E] uppercase tracking-wider font-semibold">
                Demo Managing Partner
              </div>
              <div className="font-mono text-[#B4B7BC] text-xs">
                admin@briefcase.in • Admin@2026
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className="px-3 py-1.5 rounded-[3px] court-btn-brass text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-[#0A0A0B]" />
              <span>Fill</span>
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="p-3 bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 rounded-[3px] text-[#E67272] text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-[#E67272] flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#3F7D5C]/20 border border-[#3F7D5C]/60 rounded-[3px] text-[#72C095] text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#72C095] flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6F76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@briefcase.in"
                  className="w-full pl-10 pr-4 py-2.5 court-input text-xs font-mono text-white placeholder-[#6B6F76]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC]">
                  Password
                </label>
                <span className="text-[10px] text-[#6B6F76] font-mono">Bcrypt Secured</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B6F76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 court-input text-xs font-mono text-white placeholder-[#6B6F76]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6F76] hover:text-[#D4B97E] p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-[#B4B7BC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-[2px] bg-[#141416] border-[#2B2D32] text-[#B8975A] focus:ring-[#B8975A]"
                />
                <span className="text-xs font-sans">Remember this terminal</span>
              </label>
              <Link to="/register" className="text-[#D4B97E] hover:underline font-mono text-[11px]">
                Enrol Counsel Account
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 court-btn-brass rounded-[3px] text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 group hover:scale-[1.01]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Practice Chambers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B] transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="text-center pt-2">
            <p className="text-[11px] font-sans text-[#6B6F76]">
              Privileged access strictly reserved for authorized chambers counsel, staff, and enrolled clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
