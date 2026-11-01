import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import Logo from '../components/Logo';
import { MagneticButton } from '../components/ui';
import { EASE_EXPO } from '../lib/motion';
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

const quotes = [
  {
    text: 'Justice is not argued. It is built upon precedent, precision, and unwavering statutory grounding.',
    author: 'Adv. Rajesh Mehta, Senior Advocate'
  },
  {
    text: 'A lawyer’s time and advice are his stock in trade. Rigorous counsel demands an uncompromising digital practice.',
    author: 'Chambers Practice Maxim'
  },
  {
    text: 'In the courtroom, clarity is supreme. Outside the courtroom, discipline is everything.',
    author: 'Appellate Division Bench'
  }
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate quotes every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
        setSuccessMsg('Credentials verified. Entering chambers portal...');
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
    <div className="min-h-screen w-full bg-ink text-ivory flex flex-col lg:flex-row antialiased selection:bg-brass/30 selection:text-white">
      {/* Subtle Grain & Vignette */}
      <div className="film-grain" />

      {/* Left Column: Cinematic Courtroom & Rotating Quote */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-brass/15 bg-charcoal">
        {/* Background Image with Ken Burns Zoom */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="/gavel-courtroom.jpg"
            alt="BriefCase Dark Courtroom Bench"
            animate={{ scale: [1.03, 1.08, 1.03] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full object-cover object-center filter brightness-[0.3] contrast-[1.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/90" />
          <div className="absolute inset-0 bg-radial from-transparent to-ink/90" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="outline-none">
            <Logo size="md" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-silver hover:text-brass transition-colors py-1.5 px-3.5 rounded-xs border border-brass/20 bg-charcoal/80 backdrop-blur-md"
          >
            <Home className="w-3.5 h-3.5 text-brass" />
            <span>Public Website</span>
          </Link>
        </div>

        {/* Center Editorial Quote with Fade Transition */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-charcoal/90 border border-brass/30 text-[10px] font-mono tracking-widest text-brass uppercase shadow-md mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Chambers Terminal</span>
          </div>

          <div className="h-36 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: EASE_EXPO }}
                className="space-y-4"
              >
                <blockquote className="font-serif text-2xl xl:text-3xl text-ivory font-light leading-snug">
                  &ldquo;{quotes[quoteIndex].text}&rdquo;
                </blockquote>
                <p className="font-mono text-xs text-brass tracking-wider">
                  — {quotes[quoteIndex].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-silver/60 pt-4 border-t border-brass/15">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-brass" />
            <span>Role-Based Privilege (RBAC)</span>
          </div>
          <span>Bcrypt • 256-Bit SSL Secured</span>
        </div>
      </div>

      {/* Right Column: Courtroom Form Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-12 relative bg-ink pinstripe-charcoal">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Top Brand */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-brass/15">
            <Logo size="sm" />
            <Link to="/" className="text-xs font-mono text-silver hover:text-brass flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-brass">
              CHAMBERS ACCESS
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-ivory tracking-tight font-medium">
              Counsel Portal Sign In
            </h1>
            <p className="text-xs sm:text-sm text-silver/70 font-light">
              Enter verified credentials to access your chambers portfolio.
            </p>
          </div>

          {/* Demonstration Quick Fill Banner */}
          <div className="p-3.5 bg-charcoal/80 border border-brass/25 rounded-xs flex items-center justify-between gap-3 text-xs shadow-md">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-brass uppercase tracking-wider font-semibold">
                Demo Managing Partner
              </div>
              <div className="font-mono text-silver/80 text-xs">
                admin@briefcase.in • Admin@2026
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className="court-btn-brass px-3 py-1.5 rounded-xs text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-ink" />
              <span>Fill</span>
            </button>
          </div>

          {/* Error Message with Shake Animation */}
          {error && (
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [-8, 8, -6, 6, -3, 3, 0] }}
              transition={{ duration: 0.4 }}
              className="p-3.5 bg-court-danger/20 border border-court-danger/50 rounded-xs text-red-300 text-xs flex items-start space-x-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-court-success/20 border border-court-success/50 rounded-xs text-emerald-300 text-xs flex items-start space-x-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@briefcase.in"
                  className="court-input w-full pl-10 pr-4 py-2.5 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80">
                  Password
                </label>
                <span className="text-[10px] text-silver/50 font-mono">Bcrypt Secured</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="court-input w-full pl-10 pr-10 py-2.5 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-brass p-1 cursor-pointer transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-silver/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-xs bg-charcoal border-slate text-brass focus:ring-brass"
                />
                <span>Remember this terminal</span>
              </label>
              <Link to="/register" className="text-brass hover:underline font-mono text-[11px]">
                Enrol Counsel Account
              </Link>
            </div>

            <MagneticButton
              type="submit"
              variant="brass"
              size="md"
              disabled={loading}
              className="w-full uppercase font-mono tracking-wider text-xs shadow-xl py-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In to Chambers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink" />
                </span>
              )}
            </MagneticButton>
          </form>

          {/* Privacy Note */}
          <div className="text-center pt-2">
            <p className="text-[11px] font-sans text-silver/50 font-light">
              Privileged access strictly reserved for authorized chambers counsel, staff, and enrolled clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
