import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Logo from '../components/Logo';
import { lawyerService } from '../services/api';
import {
  Scale,
  Shield,
  Building,
  Gavel,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  ChevronRight,
  FileText,
  Lock,
  ArrowUpRight,
  Download,
  BookOpen,
  GraduationCap,
  Sparkles,
  X
} from 'lucide-react';

export default function PublicHome() {
  const [lawyers, setLawyers] = useState([]);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeTab, setActiveResumeTab] = useState('profile');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    practiceArea: 'Civil Litigation',
    message: ''
  });

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await lawyerService.getAll();
        if (res.data?.data?.length > 0) {
          setLawyers(res.data.data.slice(0, 3));
        }
      } catch (err) {
        // Fallback handled gracefully
      }
    };
    fetchLawyers();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const handleDownloadResume = () => {
    window.print();
  };

  const practiceAreas = [
    {
      title: 'Civil & Commercial Litigation',
      tag: 'Civil Law',
      desc: 'High-stakes contract breaches, property title claims, recovery suits, and appellate arguments.',
      icon: Scale
    },
    {
      title: 'Corporate Advisory & Arbitration',
      tag: 'Commercial',
      desc: 'Regulatory compliance, joint ventures, domestic and international commercial arbitrations.',
      icon: Building
    },
    {
      title: 'Criminal Defense & White-Collar',
      tag: 'Trial & Bail',
      desc: 'Economic offense investigations, statutory defense, and High Court bail proceedings.',
      icon: Gavel
    },
    {
      title: 'Real Estate & Infrastructure Writs',
      tag: 'Property & Constitutional',
      desc: 'Land acquisition, title due diligence, RERA claims, and High Court writ petitions.',
      icon: BookOpen
    }
  ];

  const methodology = [
    { step: '01', title: 'Intake & Fact Finding', desc: 'Material fact extraction and core objective framing.' },
    { step: '02', title: 'Jurisdictional Assessment', desc: 'Precedents, statutory limitation, and bench analysis.' },
    { step: '03', title: 'Courtroom Advocacy', desc: 'Pleading drafting, interim relief, and oral arguments.' },
    { step: '04', title: 'Decree Enforcement', desc: 'Post-hearing compliance, decree execution, and reporting.' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F6F4EF] selection:bg-[#B8975A]/30 selection:text-white antialiased font-sans">
      {/* Navigation */}
      <PublicNavbar />

      {/* HERO SECTION - Fit to Screen, Cinematic Navy/Espresso, High Prestige */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-24 pb-14 px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Layered Architectural Law Image with Midnight Navy Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/courthouse.jpg"
            alt="BriefCase Supreme Court & Chambers Architecture"
            className="w-full h-full object-cover object-center filter brightness-[0.34] contrast-[1.15] scale-105"
          />
          {/* Midnight Navy & Obsidian Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/95 via-[#141416]/90 to-[#000000]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B]/80" />
          {/* Warm Espresso Shading */}
          <div className="absolute inset-0 bg-[#000000]/30 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase font-semibold bg-[#1E1F23]/90 text-[#ecdcc0] border border-[#ecdcc0]/40 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#ecdcc0] animate-pulse" />
            BriefCase Chambers • Advocates & Legal Consultants
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
            Precision in Counsel. <br />
            <span className="italic gold-text-gradient font-serif">Authority in the Courtroom.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#F6F4EF]/85 font-serif leading-relaxed max-w-2xl mx-auto">
            Disciplined legal strategy, meticulous case dockets, and steadfast courtroom representation across high courts, tribunals, and appellate benches.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 court-btn-brass hover:from-[#ffffff] hover:to-[#f0e2c9] text-[#0A0A0B] font-semibold rounded-sm text-xs font-mono font-medium uppercase tracking-wider transition-all duration-200 shadow-xl shadow-black/50 hover:scale-[1.02]"
            >
              <span>Consult Chambers</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B]" />
            </a>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 bg-[#24262B]/90 hover:bg-[#2B2D32] border border-[#B8975A]/35 hover:border-white/40 text-[#F6F4EF] hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-200 backdrop-blur-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#F6F4EF]" />
              <span>Chambers Resume & CV</span>
            </button>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-[#B8975A]/25 hover:border-white/30 text-[#F6F4EF]/80 hover:text-white rounded-sm text-xs font-mono uppercase tracking-wider transition-all duration-200"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </Link>
          </div>

          {/* Clean Metric Badges */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3 rounded-sm bg-[#1E1F23]/80 border border-[#2B2D32] backdrop-blur-sm">
              <div className="text-xl font-serif font-bold text-white">22+</div>
              <div className="text-[11px] font-mono text-[#F6F4EF]/70 uppercase tracking-wider">Years Experience</div>
            </div>
            <div className="p-3 rounded-sm bg-[#1E1F23]/80 border border-[#2B2D32] backdrop-blur-sm">
              <div className="text-xl font-serif font-bold text-white">1,200+</div>
              <div className="text-[11px] font-mono text-[#F6F4EF]/70 uppercase tracking-wider">Handled Dockets</div>
            </div>
            <div className="p-3 rounded-sm bg-[#1E1F23]/80 border border-[#2B2D32] backdrop-blur-sm">
              <div className="text-xl font-serif font-bold text-white">6 Benches</div>
              <div className="text-[11px] font-mono text-[#F6F4EF]/70 uppercase tracking-wider">Judicial Coverage</div>
            </div>
            <div className="p-3 rounded-sm bg-[#1E1F23]/80 border border-[#2B2D32] backdrop-blur-sm">
              <div className="text-xl font-serif font-bold text-white">100%</div>
              <div className="text-[11px] font-mono text-[#F6F4EF]/70 uppercase tracking-wider">Audit Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: THE FIRM & PHOTOGRAPHIC SHOWCASE */}
      <section id="firm" className="bc-cream py-16 px-4 sm:px-6 md:px-8 border-t border-[#2B2D32] bg-[#1E1F23]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#F6F4EF]/70">The Firm</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-snug">
                Advocacy Rooted in Law, <br />
                <span className="italic text-[#f3e3c7]">Executed with Precision.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#F6F4EF]/80 font-serif leading-relaxed">
                BriefCase represents individuals, corporate entities, and institutions before District Courts, High Courts, and Arbitral Tribunals. We combine deep statutory grounding with digital case management to ensure transparent, dependable counsel.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[#F6F4EF]/85">
                <div className="flex items-center gap-1.5 bg-[#1E1F23] px-3 py-1.5 rounded-sm border border-[#2B2D32]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Ethical Advocacy</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#1E1F23] px-3 py-1.5 rounded-sm border border-[#2B2D32]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Fiduciary Trust</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#1E1F23] px-3 py-1.5 rounded-sm border border-[#2B2D32]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Transparent Practice</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-sm overflow-hidden border border-[#B8975A]/25 shadow-2xl group">
              <img
                src="/law_library.jpg"
                alt="Law Chambers Research Library"
                className="w-full h-72 object-cover filter brightness-[0.7] contrast-[1.1] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#1E1F23]/90 backdrop-blur-md rounded-sm border border-[#2B2D32] flex items-center justify-between">
                <div>
                  <div className="text-xs font-serif font-semibold text-white">Chambers Law Library & Research Desk</div>
                  <div className="text-[11px] font-mono text-[#F6F4EF]/70">Exhaustive judicial precedents & statutory authorities.</div>
                </div>
                <button
                  onClick={() => setResumeModalOpen(true)}
                  className="text-xs font-mono text-white underline hover:text-[#F6F4EF] cursor-pointer shrink-0 ml-2"
                >
                  View CV
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: PRACTICE AREAS - Less Content, High Clarity */}
      <section id="practice-areas" className="py-16 px-4 sm:px-6 md:px-8 border-t border-[#2B2D32] bg-[#141416]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#F6F4EF]/70">Jurisdictions</div>
              <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">Core Practice Areas</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#F6F4EF]/70 font-mono max-w-md">
              Focused legal domains handled before District Courts, High Courts, and Arbitral Tribunals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {practiceAreas.map((pa, idx) => {
              const Icon = pa.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#1E1F23] p-5 rounded-sm border border-[#2B2D32] hover:border-white/30 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-sm bg-[#2B2D32] border border-[#B8975A]/25 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-[#F6F4EF]/60 tracking-wider uppercase">{pa.tag}</span>
                    </div>

                    <h3 className="font-serif font-semibold text-white text-base group-hover:text-white transition-colors">
                      {pa.title}
                    </h3>

                    <p className="font-serif text-xs text-[#F6F4EF]/75 leading-relaxed">
                      {pa.desc}
                    </p>
                  </div>

                  <a
                    href="#contact"
                    className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#F6F4EF]/60 group-hover:text-white transition-colors"
                  >
                    <span>Inquire Matter</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION C: CHAMBERS RESUME & CREDENTIALS (DEDICATED SECTION) */}
      <section id="resume" className="bc-cream py-16 px-4 sm:px-6 md:px-8 border-t border-[#2B2D32] bg-[#1E1F23]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#F6F4EF]/70">Curriculum Vitae & Standing</div>
              <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">Chambers Resume & Credentials</h2>
            </div>
            <button
              onClick={() => setResumeModalOpen(true)}
              className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2 court-btn-brass hover:from-[#ffffff] hover:to-[#f0e2c9] text-[#0A0A0B] font-semibold rounded-sm text-xs font-mono uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#0A0A0B]" />
              <span>Open Detailed Resume Modal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Senior Counsel CV Highlights Card */}
            <div className="bg-[#1E1F23] p-6 rounded-sm border border-[#2B2D32] space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-sm bg-[#2B2D32] border border-[#B8975A]/35 flex items-center justify-center text-white font-serif font-bold text-base">
                  RM
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-white">Adv. Rajesh Mehta</h3>
                  <div className="text-[11px] font-mono text-[#F6F4EF]/70">Senior Advocate • Bar No. G/1245/2005</div>
                </div>
              </div>
              <p className="text-xs text-[#F6F4EF]/80 font-serif leading-relaxed">
                21+ years of dedicated trial and appellate litigation. Extensive standing before High Court Benches in corporate dispute arbitration and commercial injunctions.
              </p>
              <div className="pt-2 border-t border-[#2B2D32] space-y-1.5 text-xs font-mono text-[#F6F4EF]/75">
                <div className="flex justify-between">
                  <span>Admissions:</span>
                  <span className="text-white">Supreme Court Bar, High Court</span>
                </div>
                <div className="flex justify-between">
                  <span>LL.M. Degree:</span>
                  <span className="text-white">Cambridge University</span>
                </div>
                <div className="flex justify-between">
                  <span>Reported Rulings:</span>
                  <span className="text-white">40+ Landmark Citations</span>
                </div>
              </div>
            </div>

            {/* Counsel Priya Patel CV Card */}
            <div className="bg-[#1E1F23] p-6 rounded-sm border border-[#2B2D32] space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-sm bg-[#2B2D32] border border-[#B8975A]/35 flex items-center justify-center text-white font-serif font-bold text-base">
                  PP
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-white">Adv. Priya Patel</h3>
                  <div className="text-[11px] font-mono text-[#F6F4EF]/70">Partner • Bar No. G/2356/2012</div>
                </div>
              </div>
              <p className="text-xs text-[#F6F4EF]/80 font-serif leading-relaxed">
                14 years representing landmark constitutional writ petitions, property title trials, and civil recovery proceedings before state high courts.
              </p>
              <div className="pt-2 border-t border-[#2B2D32] space-y-1.5 text-xs font-mono text-[#F6F4EF]/75">
                <div className="flex justify-between">
                  <span>Admissions:</span>
                  <span className="text-white">High Court Bar Association</span>
                </div>
                <div className="flex justify-between">
                  <span>LL.B. Honors:</span>
                  <span className="text-white">NLS Bangalore</span>
                </div>
                <div className="flex justify-between">
                  <span>Focus:</span>
                  <span className="text-white">Writ Petitions & Land Title</span>
                </div>
              </div>
            </div>

            {/* Counsel Vikramaditya Desai CV Card */}
            <div className="bg-[#1E1F23] p-6 rounded-sm border border-[#2B2D32] space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-sm bg-[#2B2D32] border border-[#B8975A]/35 flex items-center justify-center text-white font-serif font-bold text-base">
                  VD
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-white">Adv. Vikramaditya Desai</h3>
                  <div className="text-[11px] font-mono text-[#F6F4EF]/70">Associate Counsel • Bar No. G/3478/2015</div>
                </div>
              </div>
              <p className="text-xs text-[#F6F4EF]/80 font-serif leading-relaxed">
                11 years trial advocacy specializing in statutory compliance, white-collar crime defense, economic offenses investigations, and bail appeals.
              </p>
              <div className="pt-2 border-t border-[#2B2D32] space-y-1.5 text-xs font-mono text-[#F6F4EF]/75">
                <div className="flex justify-between">
                  <span>Admissions:</span>
                  <span className="text-white">Sessions & High Court Benches</span>
                </div>
                <div className="flex justify-between">
                  <span>Education:</span>
                  <span className="text-white">Government Law College</span>
                </div>
                <div className="flex justify-between">
                  <span>Focus:</span>
                  <span className="text-white">Statutory Defense & Trial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: METHODOLOGY (4 STREAMLINED STEPS) */}
      <section id="approach" className="py-16 px-4 sm:px-6 md:px-8 border-t border-[#2B2D32] bg-[#141416]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#F6F4EF]/70">Methodology</div>
            <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">Strategic Legal Workflow</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {methodology.map((m, i) => (
              <div
                key={i}
                className="bg-[#1E1F23] p-5 rounded-sm border border-[#2B2D32] hover:border-white/30 transition-all duration-200"
              >
                <div className="text-xl font-mono font-bold text-white/40">{m.step}</div>
                <h3 className="font-serif font-semibold text-white text-base mt-2">{m.title}</h3>
                <p className="font-serif text-xs text-[#F6F4EF]/75 mt-1.5 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION E: CONTACT & CONSULTATION - Compact & Fit */}
      <section id="contact" className="bc-cream py-16 px-4 sm:px-6 md:px-8 border-t border-[#2B2D32] bg-[#1E1F23]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1E1F23] border border-[#B8975A]/25 rounded-sm p-6 sm:p-8 shadow-2xl">
            <div className="text-center max-w-lg mx-auto space-y-2 mb-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#F6F4EF]/70">Confidential Inquiry</div>
              <h2 className="text-2xl sm:text-3xl font-serif text-white">Consult Our Chambers</h2>
              <p className="text-xs sm:text-sm text-[#F6F4EF]/75 font-serif">
                Schedule a privileged consultation with our advocates regarding ongoing or prospective matters.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="p-6 bg-[#141416] border border-[#B8975A]/35 rounded-sm text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
                <h3 className="text-base font-serif font-semibold text-white">Inquiry Registered</h3>
                <p className="text-xs font-serif text-[#F6F4EF]/80 max-w-md mx-auto">
                  Thank you for contacting BriefCase. Our chambers registrar will review your matter and contact you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F6F4EF]/70 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sureshchandra Trivedi"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141416] border border-[#2B2D32] focus:border-white rounded-sm text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F6F4EF]/70 mb-1">Email Identifier *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141416] border border-[#2B2D32] focus:border-white rounded-sm text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F6F4EF]/70 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98250 00000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141416] border border-[#2B2D32] focus:border-white rounded-sm text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F6F4EF]/70 mb-1">Area of Inquiry</label>
                    <select
                      value={contactForm.practiceArea}
                      onChange={(e) => setContactForm({ ...contactForm, practiceArea: e.target.value })}
                      className="w-full px-3 py-2 bg-[#141416] border border-[#2B2D32] focus:border-white rounded-sm text-xs text-white font-mono focus:outline-none"
                    >
                      <option value="Civil Litigation">Civil & Commercial Litigation</option>
                      <option value="Corporate Law">Corporate & Arbitration</option>
                      <option value="Criminal Defense">White-Collar & Trial Defense</option>
                      <option value="Real Estate">Property & Infrastructure Writs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#F6F4EF]/70 mb-1">Brief Description</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Provide a concise summary of the legal matter..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141416] border border-[#2B2D32] focus:border-white rounded-sm text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-2.5 court-btn-brass hover:from-[#ffffff] hover:to-[#f0e2c9] text-[#0A0A0B] font-semibold rounded-sm text-xs font-mono font-medium uppercase tracking-wider transition-all duration-200 shadow-lg cursor-pointer"
                  >
                    Submit Privileged Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 sm:px-6 md:px-8 border-t border-[#2B2D32] bg-[#0A0A0B] text-[#F6F4EF]/70 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="font-mono text-[11px] text-center sm:text-left">
            © {new Date().getFullYear()} BriefCase Chambers. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <button onClick={() => setResumeModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Chambers Resume
            </button>
            <Link to="/login" className="hover:text-white transition-colors">Client Portal</Link>
            <a href="#firm" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE CHAMBERS RESUME & CV MODAL */}
      {resumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#1E1F23] border border-[#B8975A]/35 rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2B2D32] flex items-center justify-between bg-[#141416]">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-white">Chambers Curriculum Vitae & Credentials</h3>
                  <div className="text-[10px] font-mono text-[#F6F4EF]/60 uppercase tracking-wider">BriefCase Chambers • Official Practice Profile</div>
                </div>
              </div>
              <button
                onClick={() => setResumeModalOpen(false)}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2B2D32] bg-[#1E1F23] px-6 text-xs font-mono">
              <button
                onClick={() => setActiveResumeTab('profile')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeResumeTab === 'profile'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#F6F4EF]/60 hover:text-white'
                }`}
              >
                Partners & Standing
              </button>
              <button
                onClick={() => setActiveResumeTab('precedents')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeResumeTab === 'precedents'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#F6F4EF]/60 hover:text-white'
                }`}
              >
                Landmark Precedents
              </button>
              <button
                onClick={() => setActiveResumeTab('academics')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeResumeTab === 'academics'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#F6F4EF]/60 hover:text-white'
                }`}
              >
                Admissions & Honors
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif text-[#F6F4EF]/85 leading-relaxed">
              {activeResumeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded bg-[#141416] border border-[#2B2D32]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-white">Adv. Rajesh Mehta, LL.M. (Cantab)</h4>
                        <div className="text-[11px] font-mono text-[#F6F4EF]/70">Senior Advocate • 21 Years Standing • Bar No. G/1245/2005</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Head of Chambers</span>
                    </div>
                    <p className="mt-2 text-xs text-[#F6F4EF]/80">
                      Admitted to the Bar Council in 2005. Regularly briefed on high-stakes corporate disputes, insolvency proceedings, contractual arbitrations, and special leave petitions.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-[#141416] border border-[#2B2D32]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-white">Adv. Priya Patel, LL.B. (Hons) NLS</h4>
                        <div className="text-[11px] font-mono text-[#F6F4EF]/70">Partner • 14 Years Standing • Bar No. G/2356/2012</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Appellate & Constitutional</span>
                    </div>
                    <p className="mt-2 text-xs text-[#F6F4EF]/80">
                      National Law School graduate with expertise in property rights, land acquisition writs, environmental law disputes, and succession disputes.
                    </p>
                  </div>
                </div>
              )}

              {activeResumeTab === 'precedents' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#141416] border border-[#2B2D32] rounded">
                    <div className="font-mono text-white text-xs font-semibold">Sterling Logistics vs. Port Infrastructure Corp (2024)</div>
                    <div className="text-[11px] font-mono text-emerald-400">High Court of Gujarat • Favorable Injunction Secured</div>
                    <p className="mt-1 text-xs text-[#F6F4EF]/75">
                      Successfully established breach of tender covenants and protected ₹42 Cr in maritime infrastructure assets through emergency interim relief.
                    </p>
                  </div>
                  <div className="p-3 bg-[#141416] border border-[#2B2D32] rounded">
                    <div className="font-mono text-white text-xs font-semibold">M/s Horizon Developers vs. Municipal Corporation (2023)</div>
                    <div className="text-[11px] font-mono text-emerald-400">Commercial Division Bench • Decree in Favor of Client</div>
                    <p className="mt-1 text-xs text-[#F6F4EF]/75">
                      Argued landmark interpretation of building bylaws, setting a precedent in developmental transferable rights.
                    </p>
                  </div>
                </div>
              )}

              {activeResumeTab === 'academics' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-[#141416] border border-[#2B2D32] rounded flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Supreme Court Bar Association (SCBA)</div>
                      <div className="text-[#F6F4EF]/60 text-[11px]">Active Member in Good Standing</div>
                    </div>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-3 bg-[#141416] border border-[#2B2D32] rounded flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Bar Council of Gujarat & High Court Advocates Association</div>
                      <div className="text-[#F6F4EF]/60 text-[11px]">Enrolled 2005 • Continuous Practice Record</div>
                    </div>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-3 bg-[#141416] border border-[#2B2D32] rounded flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Chartered Institute of Arbitrators (CIArb)</div>
                      <div className="text-[#F6F4EF]/60 text-[11px]">Fellowship Credential in Commercial Dispute Resolution</div>
                    </div>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 border-t border-[#2B2D32] bg-[#141416] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#F6F4EF]/60">Chambers Profile v2.6 • Verified Record</span>
              <button
                onClick={handleDownloadResume}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 court-btn-brass hover:from-[#ffffff] hover:to-[#f0e2c9] text-[#0A0A0B] font-semibold rounded-sm text-xs font-mono uppercase tracking-wider font-semibold shadow transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download Resume</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
