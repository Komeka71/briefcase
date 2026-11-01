import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import Logo from '../components/Logo';
import { MagneticButton } from '../components/ui';
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
  Home,
  Scale
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
        setSuccessMsg('Counsel registered successfully. Entering practice chambers...');
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
    <div className="min-h-screen w-full bg-ink text-ivory flex flex-col lg:flex-row antialiased selection:bg-brass/30 selection:text-white">
      {/* Subtle Grain */}
      <div className="film-grain" />

      {/* Left Column: Visual Authority & Chambers Standards */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-brass/15 bg-charcoal">
        <div className="absolute inset-0 z-0">
          <motion.img
            src="/gavel-courtroom.jpg"
            alt="BriefCase Dark Courtroom"
            animate={{ scale: [1.03, 1.07, 1.03] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full object-cover object-center filter brightness-[0.28] contrast-[1.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/90" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="outline-none">
            <Logo size="md" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-silver hover:text-brass transition-colors py-1.5 px-3.5 rounded-xs border border-brass/20 bg-charcoal/80 backdrop-blur-md"
          >
            <Home className="w-3.5 h-3.5 text-brass" />
            <span>Firm Website</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-charcoal/90 border border-brass/30 text-[10px] font-mono tracking-widest text-brass uppercase shadow-md">
            <Shield className="w-3.5 h-3.5" />
            <span>Personnel & Counsel Enrollment</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl leading-tight text-white font-medium">
            &ldquo;Every legal docket deserves precision, structure, and{' '}
            <span className="italic brass-text-gradient font-normal">uncompromising</span> integrity.&rdquo;
          </h2>

          <p className="text-silver/80 text-xs sm:text-sm leading-relaxed font-sans font-light">
            Enrol practice advocates, associates, and legal registrars with granular role-based permissions and complete cryptographic auditability.
          </p>

          <div className="pt-4 border-t border-brass/15 flex items-center gap-6 text-xs text-silver/80 font-mono">
            <div>
              <span className="block text-ivory font-serif text-sm">256-Bit</span>
              <span className="text-[10px] text-silver/60">Encrypted Dockets</span>
            </div>
            <div className="h-6 w-[1px] bg-slate/50" />
            <div>
              <span className="block text-ivory font-serif text-sm">Strict RBAC</span>
              <span className="text-[10px] text-silver/60">Privileged Roles</span>
            </div>
            <div className="h-6 w-[1px] bg-slate/50" />
            <div>
              <span className="block text-ivory font-serif text-sm">Triggers</span>
              <span className="text-[10px] text-silver/60">Forensic Audit Log</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-silver/60 pt-4 border-t border-brass/15">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-brass" />
            <span>Bar Council Practice Standards</span>
          </div>
          <span>ISO 27001 Protocol</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 relative bg-ink pinstripe-charcoal">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-brass/15">
            <Logo size="sm" />
            <Link to="/" className="text-xs font-mono text-silver hover:text-brass flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-brass">
              COUNSEL ENROLLMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-ivory tracking-tight font-medium">
              Create Chambers Account
            </h1>
            <p className="text-xs sm:text-sm text-silver/70 font-light">
              Register an authorized terminal within the BriefCase platform.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [-8, 8, -6, 6, -3, 3, 0] }}
              transition={{ duration: 0.4 }}
              className="p-3 bg-court-danger/20 border border-court-danger/50 rounded-xs text-red-300 text-xs flex items-start space-x-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-court-success/20 border border-court-success/50 rounded-xs text-emerald-300 text-xs flex items-start space-x-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Full Legal Name & Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adv. Rajesh Sharma"
                  className="court-input w-full pl-10 pr-4 py-2 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.sharma@briefcase.in"
                  className="court-input w-full pl-10 pr-4 py-2 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                Chambers Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="court-input w-full px-3 py-2 text-xs font-mono bg-charcoal cursor-pointer"
              >
                <option value="Lawyer">Lawyer / Senior Advocate</option>
                <option value="Admin">Admin / Chambers Partner</option>
                <option value="Assistant">Legal Assistant / Paralegal</option>
                <option value="Staff">Clerical Staff / Registrar</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="court-input w-full pl-9 pr-8 py-2 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-brass p-0.5 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="court-input w-full pl-9 pr-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <MagneticButton
              type="submit"
              variant="brass"
              size="md"
              disabled={loading}
              className="w-full uppercase font-mono tracking-wider text-xs shadow-xl py-3 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Enrol Account in Chambers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink" />
                </span>
              )}
            </MagneticButton>
          </form>

          <div className="text-center pt-2 border-t border-brass/10">
            <p className="text-xs text-silver/70 font-sans">
              Already possess chambers credentials?{' '}
              <Link to="/login" className="text-brass hover:underline font-mono ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
