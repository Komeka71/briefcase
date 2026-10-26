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
    <div className="min-h-screen w-full bg-[#0A0A0B] text-[#F6F4EF] flex flex-col lg:flex-row antialiased selection:bg-[#B8975A]/30 selection:text-white">
      {/* Left Visual Column: Courtroom & Chambers Authority */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-[#2B2D32] bg-gradient-to-br from-[#000000] via-[#141416] to-[#1E1F23]">
        <div className="absolute inset-0 pinstripe-dark opacity-60 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#B8975A]/5 rounded-full blur-3xl pointer-events-none" />

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

        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-[#141416] border border-[#B8975A]/30 text-[10px] font-mono tracking-widest text-[#D4B97E] uppercase shadow-sm">
            <Shield className="w-3.5 h-3.5 text-[#B8975A]" />
            <span>Chambers Access Control</span>
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl leading-tight text-white font-medium">
            &ldquo;Every legal matter deserves structured organization, precision, and{' '}
            <span className="italic brass-text-gradient font-normal">uncompromising</span> integrity.&rdquo;
          </h2>

          <p className="text-[#B4B7BC] text-xs sm:text-sm leading-relaxed font-sans">
            Admit practice advocates, assistants, and legal staff with role-based permissions and complete forensic database audit traceability.
          </p>

          <div className="pt-3 border-t border-[#2B2D32]/80 flex items-center gap-6 text-xs text-[#B4B7BC] font-mono">
            <div>
              <span className="block text-white font-serif text-sm">256-Bit</span>
              <span className="text-[10px] text-[#6B6F76]">Encrypted State</span>
            </div>
            <div className="h-6 w-[1px] bg-[#2B2D32]" />
            <div>
              <span className="block text-white font-serif text-sm">Strict RBAC</span>
              <span className="text-[10px] text-[#6B6F76]">Granular Rights</span>
            </div>
            <div className="h-6 w-[1px] bg-[#2B2D32]" />
            <div>
              <span className="block text-white font-serif text-sm">Triggers</span>
              <span className="text-[10px] text-[#6B6F76]">Full Forensic Log</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#6B6F76] pt-4 border-t border-[#2B2D32]">
          <span>Bar Council Practice Standards</span>
          <span>Role-Based Access (RBAC)</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8 relative bg-[#0A0A0B] pinstripe-charcoal">
        <div className="max-w-md w-full mx-auto space-y-5 animate-fadeIn">
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#2B2D32]">
            <Logo size="sm" />
            <Link to="/" className="text-xs font-mono text-[#B4B7BC] hover:text-[#D4B97E] flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A]">
              Personnel Enrollment
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight font-semibold">
              Create Counsel Account
            </h1>
            <p className="text-xs sm:text-sm text-[#B4B7BC] font-sans">
              Enroll into the BriefCase practice management chambers.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                Full Name & Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6B6F76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adv. Rajesh Sharma"
                  className="w-full pl-10 pr-4 py-2 court-input text-xs font-mono text-white placeholder-[#6B6F76]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6F76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.sharma@briefcase.in"
                  className="w-full pl-10 pr-4 py-2 court-input text-xs font-mono text-white placeholder-[#6B6F76]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                Chambers Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 court-input text-xs font-mono text-white"
              >
                <option value="Lawyer" className="bg-[#141416]">Lawyer / Senior Advocate</option>
                <option value="Admin" className="bg-[#141416]">Admin / Chambers Partner</option>
                <option value="Assistant" className="bg-[#141416]">Legal Assistant / Paralegal</option>
                <option value="Staff" className="bg-[#141416]">Clerical Staff / Registrar</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-8 py-2 court-input text-xs font-mono text-white placeholder-[#6B6F76]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6F76] hover:text-[#D4B97E] p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#B4B7BC] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6F76] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 court-input text-xs font-mono text-white placeholder-[#6B6F76]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 court-btn-brass rounded-[3px] text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 group hover:scale-[1.01] mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enrol Account in Chambers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B] transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#2B2D32]">
            <p className="text-xs text-[#B4B7BC] font-sans">
              Already possess chambers credentials?{' '}
              <Link to="/login" className="text-[#D4B97E] hover:underline font-mono ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
