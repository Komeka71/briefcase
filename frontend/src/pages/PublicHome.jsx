import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import PublicNavbar from '../components/PublicNavbar';
import Logo from '../components/Logo';
import { lawyerService } from '../services/api';
import {
  Reveal,
  CountUp,
  MagneticButton,
  SectionHeading,
  GlassCard
} from '../components/ui';
import { EASE_EXPO } from '../lib/motion';
import {
  Scale,
  Building2,
  Gavel,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Award,
  ChevronDown,
  FileText,
  Lock,
  Download,
  X,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function PublicHome() {
  const [_lawyers, setLawyers] = useState([]);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResumeTab, setActiveResumeTab] = useState('profile');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    practiceArea: 'Civil Litigation',
    message: ''
  });

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], [0, 160]);

  // Smooth scroll with Lenis
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9
    });

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  // Ambient cursor follow glow on desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch lawyers from backend
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await lawyerService.getAll();
        if (res.data?.data?.length > 0) {
          setLawyers(res.data.data.slice(0, 3));
        }
      } catch {
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
      numeral: '01',
      title: 'Civil & Commercial Litigation',
      tag: 'Civil Law',
      desc: 'High-stakes contract breaches, property title claims, recovery suits, and appellate arguments before High Courts.',
      icon: Scale
    },
    {
      numeral: '02',
      title: 'Corporate Advisory & Arbitration',
      tag: 'Commercial',
      desc: 'Regulatory compliance, joint venture restructuring, domestic and international commercial arbitrations under CIArb protocols.',
      icon: Building2
    },
    {
      numeral: '03',
      title: 'White-Collar & Trial Defense',
      tag: 'Trial & Bail',
      desc: 'Economic offense investigations, corporate fraud inquiries, statutory defense, and special leave bail petitions.',
      icon: Gavel
    },
    {
      numeral: '04',
      title: 'Real Estate & Constitutional Writs',
      tag: 'Property & Writs',
      desc: 'Land acquisition disputes, title due diligence, RERA regulatory claims, and High Court writ petitions against state actions.',
      icon: BookOpen
    }
  ];

  const methodology = [
    {
      step: 'I',
      title: 'Intake & Discovery',
      desc: 'Exhaustive fact extraction, evidentiary audit, and risk posture classification under strict attorney-client privilege.'
    },
    {
      step: 'II',
      title: 'Jurisdictional Analysis',
      desc: 'Statutory limitation checks, bench tendency assessment, and retrieval of matching Supreme Court precedents.'
    },
    {
      step: 'III',
      title: 'Courtroom Advocacy',
      desc: 'Precision pleading drafting, emergency interim injunctions, and forceful oral argumentation at the bar.'
    },
    {
      step: 'IV',
      title: 'Decree Enforcement',
      desc: 'Post-judgment compliance, execution petitions, asset attachment, and transparent client reporting.'
    }
  ];

  const landmarkMatters = [
    {
      year: '2024',
      forum: 'High Court Commercial Division',
      title: 'Sterling Logistics vs. Maritime Port Authority',
      outcome: '₹42 Cr Asset Injunction Secured',
      summary: 'Established critical breach of public tender specifications and protected commercial maritime assets via emergency interim relief.'
    },
    {
      year: '2023',
      forum: 'Appellate Constitutional Bench',
      title: 'Horizon Real Estate Consortium vs. State Corporation',
      outcome: 'Unanimous Writ Ruling',
      summary: 'Set landmark precedent in transferable development rights, reversing arbitrary zoning penalties across 14 commercial projects.'
    },
    {
      year: '2022',
      forum: 'International Commercial Arbitration',
      title: 'Apex Energy Systems vs. Cross-Border EPC Contractor',
      outcome: '$18.4M Award Granted',
      summary: 'Successfully defended against liquidated damages claim and recovered full contractual retention funds with compound interest.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-ink text-ivory selection:bg-brass/30 selection:text-white antialiased font-sans overflow-x-hidden pinstripe-dark">
      {/* Subtle Film Grain & Vignette */}
      <div className="film-grain" />
      <div className="vignette-overlay" />

      {/* Ambient Cursor Glow (Desktop) */}
      <div
        className="cursor-ambient-glow hidden lg:block"
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {/* Navigation */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION - Cinematic Midnight Courtroom
          ========================================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 md:px-8 overflow-hidden"
      >
        {/* Full-Bleed Courtroom Background with Ken Burns zoom & Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            style={{ y: heroImageY }}
            animate={{ scale: [1.02, 1.07, 1.02] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-[120%] -top-[10%] relative"
          >
            <img
              src="/gavel-courtroom.jpg"
              alt="BriefCase Dark Courtroom Mahogany Bench and Gavel"
              className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.25] saturate-[0.85]"
            />
          </motion.div>

          {/* Deep Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/90" />
          <div className="absolute inset-0 bg-radial from-transparent via-ink/40 to-ink/95" />
          <div className="absolute inset-0 bg-[#1C110F]/20 mix-blend-color-burn pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Small Caps Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_EXPO }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-[0.22em] uppercase font-medium bg-charcoal/80 text-brass-light border border-brass/30 backdrop-blur-xl shadow-2xl mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
            <span>Advocates & Legal Chambers • Est. 2005</span>
          </motion.div>

          {/* Masked Headline Reveal */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-medium tracking-tight leading-[1.08] text-white max-w-4xl mx-auto mb-6">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE_EXPO }}
              className="block"
            >
              Justice is not argued.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE_EXPO }}
              className="block font-serif italic text-brass"
            >
              It is built.
            </motion.span>
          </h1>

          {/* Authoritative Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE_EXPO }}
            className="text-base sm:text-lg md:text-xl text-smoke/90 font-sans font-light leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Steadfast representation across High Courts, Arbitral Tribunals, and Appellate Benches. Powered by disciplined advocacy and enterprise-grade case orchestration.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: EASE_EXPO }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
          >
            <a href="#contact" className="w-full sm:w-auto">
              <MagneticButton
                variant="brass"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto uppercase font-mono tracking-wider text-xs shadow-2xl"
              >
                Book a Consultation
              </MagneticButton>
            </a>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <MagneticButton
                variant="outline"
                size="lg"
                icon={FileText}
                iconPosition="left"
                className="w-full sm:w-auto uppercase font-mono tracking-wider text-xs"
              >
                Chambers Resume & CV
              </MagneticButton>
            </button>

            <Link to="/login" className="w-full sm:w-auto">
              <MagneticButton
                variant="dark"
                size="lg"
                icon={Lock}
                iconPosition="left"
                className="w-full sm:w-auto uppercase font-mono tracking-wider text-xs"
              >
                Chambers Portal
              </MagneticButton>
            </Link>
          </motion.div>

          {/* Floating Glass Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE_EXPO }}
            className="w-full max-w-4xl rounded-md border border-brass/20 bg-charcoal/75 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-brass/15">
              <div className="text-center pt-2 sm:pt-0">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-ivory">
                  <CountUp value={21} suffix="+" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-silver/70 mt-1">
                  Years of Practice
                </div>
              </div>

              <div className="text-center pt-2 sm:pt-0 sm:pl-4">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-brass">
                  <CountUp value={1200} suffix="+" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-silver/70 mt-1">
                  Matters Handled
                </div>
              </div>

              <div className="text-center pt-2 sm:pt-0 sm:pl-4">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-ivory">
                  <CountUp value={96} suffix="%" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-silver/70 mt-1">
                  Injunction Success
                </div>
              </div>

              <div className="text-center pt-2 sm:pt-0 sm:pl-4">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-ivory">
                  <CountUp value={6} suffix=" Benches" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-silver/70 mt-1">
                  Judicial Standing
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-12 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => {
              const el = document.getElementById('firm');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-silver mb-1.5">
              Explore Chambers
            </span>
            <ChevronDown className="w-4 h-4 text-brass" />
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          TRUST STRIP - Courts & Bar Associations
          ========================================================================= */}
      <div className="border-y border-brass/15 bg-charcoal/90 py-5 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 text-silver/70 text-xs font-mono tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-brass" />
            <span>Supreme Court Bar Association</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brass" />
            <span>High Court of Gujarat Advocates Association</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brass" />
            <span>Chartered Institute of Arbitrators (CIArb)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brass" />
            <span>ISO 27001 Certified Practice Dockets</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION I: OUR FIRM
          ========================================================================= */}
      <section id="firm" className="py-24 px-4 sm:px-6 md:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            numeral="I"
            eyebrow="The Practice"
            title="Advocacy Rooted in Law, Executed with Unwavering Rigor."
            subtitle="Representing individuals, institutions, and sovereign entities in trial courts, constitutional benches, and arbitral forums."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <Reveal variant="fadeUp">
                <blockquote className="border-l-2 border-brass pl-5 py-2 my-2 font-serif text-xl sm:text-2xl italic text-ivory/95 leading-relaxed">
                  "A case is never won by rhetoric alone. It is won in the late hours of the library, the exactitude of pleading, and the poise with which counsel stands before the bench."
                </blockquote>
              </Reveal>

              <Reveal variant="fadeUp" delay={0.1}>
                <p className="text-silver/85 font-light leading-relaxed">
                  BriefCase Chambers was founded on an exacting standard: every client’s matter is treated as if it were destined for reported precedent. We blend rigorous statutory analysis with enterprise-grade case management systems, giving our clients complete clarity at every stage of dispute resolution.
                </p>
              </Reveal>

              <Reveal variant="fadeUp" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xs border border-brass/15 bg-charcoal/50">
                    <h4 className="font-serif text-base font-semibold text-ivory flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-brass" />
                      Fiduciary Confidentiality
                    </h4>
                    <p className="text-xs text-silver/70 font-light">
                      Strict digital access segregation and cryptographic privilege protocols.
                    </p>
                  </div>

                  <div className="p-4 rounded-xs border border-brass/15 bg-charcoal/50">
                    <h4 className="font-serif text-base font-semibold text-ivory flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-brass" />
                      Appellate Standing
                    </h4>
                    <p className="text-xs text-silver/70 font-light">
                      Regularly engaged as special counsel in constitutional writ hearings.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Photographic Offset with Brass Frame */}
            <div className="lg:col-span-6 relative">
              <Reveal variant="scaleIn" delay={0.15}>
                <div className="relative mx-auto max-w-lg">
                  {/* Decorative Brass Frame Behind Image */}
                  <div className="absolute -inset-3 rounded-md border border-brass/40 translate-x-3 translate-y-3 pointer-events-none" />

                  {/* Main Image Container */}
                  <div className="relative rounded-md overflow-hidden border border-brass/30 shadow-2xl bg-charcoal aspect-[4/3]">
                    <img
                      src="/law_library.jpg"
                      alt="Chambers Research Library & Jurisprudential Archive"
                      className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.1] transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xs bg-charcoal/90 backdrop-blur-md border border-brass/20 flex items-center justify-between">
                      <div>
                        <div className="font-serif text-sm font-semibold text-ivory">
                          The Chambers Research Desk
                        </div>
                        <div className="text-[11px] font-mono text-silver/70">
                          30,000+ indexed rulings, digests & statutory authorities
                        </div>
                      </div>
                      <button
                        onClick={() => setResumeModalOpen(true)}
                        className="text-xs font-mono text-brass hover:text-brass-light flex items-center gap-1 cursor-pointer"
                      >
                        <span>View CV</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION II: PRACTICE AREAS
          ========================================================================= */}
      <section id="practice-areas" className="py-24 px-4 sm:px-6 md:px-8 border-t border-brass/15 bg-charcoal/40">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            numeral="II"
            eyebrow="Jurisdictions & Domains"
            title="Core Practice Areas"
            subtitle="Focused legal expertise backed by continuous trial experience and deep industry knowledge."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceAreas.map((pa, idx) => {
              const Icon = pa.icon;
              return (
                <Reveal key={pa.title} variant="fadeUp" delay={idx * 0.1}>
                  <GlassCard className="p-6 h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xs bg-graphite/90 border border-brass/30 flex items-center justify-center text-brass group-hover:border-brass group-hover:scale-105 transition-all">
                          <Icon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-silver/60">
                          {pa.tag}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-semibold text-ivory mb-2 group-hover:text-brass transition-colors">
                        {pa.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-silver/70 font-light leading-relaxed">
                        {pa.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-brass/10 flex items-center justify-between text-xs font-mono text-brass group-hover:text-brass-light">
                      <span>Inquire Representation</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION III: LANDMARK MATTERS & PRECEDENTS
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 md:px-8 border-t border-brass/15 bg-ink">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="font-mono text-xs tracking-[0.2em] uppercase text-brass mb-2">
                SECTION III • RULINGS
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ivory">
                Landmark Matters & Judicial Outcomes
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-silver/70 font-mono max-w-md">
              A curated selection of recent reported rulings and arbitral awards secured on behalf of chambers clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landmarkMatters.map((item, idx) => (
              <Reveal key={item.title} variant="fadeUp" delay={idx * 0.12}>
                <div className="p-6 rounded-md bg-charcoal/60 border border-brass/15 hover:border-brass/35 transition-all space-y-3 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-silver/60">
                      <span>{item.year}</span>
                      <span className="text-brass text-[11px]">{item.forum}</span>
                    </div>

                    <h3 className="font-serif text-base font-semibold text-ivory mt-2">
                      {item.title}
                    </h3>

                    <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      {item.outcome}
                    </div>

                    <p className="mt-3 text-xs text-silver/80 font-light leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate/30 text-[11px] font-mono text-silver/50 flex items-center justify-between">
                    <span>Privileged Case Brief</span>
                    <ExternalLink className="w-3.5 h-3.5 text-brass/70" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION IV: CHAMBERS RESUME & TIMELINE
          ========================================================================= */}
      <section id="resume" className="py-24 px-4 sm:px-6 md:px-8 border-t border-brass/15 bg-charcoal/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            numeral="IV"
            eyebrow="Standing & Credentials"
            title="Chambers Resume & Senior Counsel"
            subtitle="Decades of continuous practice before the Bar with recognized academic and judicial standing."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Counsel 1: Adv Rajesh Mehta */}
            <Reveal variant="fadeUp" delay={0.05}>
              <GlassCard className="p-7 space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3.5 pb-4 border-b border-brass/15">
                    <div className="w-12 h-12 rounded-xs bg-graphite border border-brass/40 flex items-center justify-center font-serif text-lg font-bold text-brass">
                      RM
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-ivory">
                        Adv. Rajesh Mehta
                      </h3>
                      <div className="text-xs font-mono text-silver/70">
                        Senior Advocate • LL.M. (Cantab)
                      </div>
                      <div className="text-[10px] font-mono text-brass mt-0.5">
                        Bar No. G/1245/2005 • 21 Yrs Standing
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-silver/80 font-light leading-relaxed">
                    Head of Chambers. Regularly briefed by multinational corporations, infrastructure developers, and banking consortia in high-value commercial arbitrations and special leave petitions.
                  </p>

                  <div className="mt-5 space-y-2 text-xs font-mono text-silver/80 pt-4 border-t border-slate/40">
                    <div className="flex justify-between">
                      <span className="text-silver/50">Admissions:</span>
                      <span className="text-ivory">Supreme Court & High Court</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver/50">Education:</span>
                      <span className="text-ivory">University of Cambridge</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver/50">Reported Rulings:</span>
                      <span className="text-brass">45+ Landmark Citations</span>
                    </div>
                  </div>
                </div>

                <MagneticButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveResumeTab('profile');
                    setResumeModalOpen(true);
                  }}
                  className="w-full text-xs font-mono uppercase tracking-wider"
                >
                  View Senior Profile
                </MagneticButton>
              </GlassCard>
            </Reveal>

            {/* Counsel 2: Adv Priya Patel */}
            <Reveal variant="fadeUp" delay={0.15}>
              <GlassCard className="p-7 space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3.5 pb-4 border-b border-brass/15">
                    <div className="w-12 h-12 rounded-xs bg-graphite border border-brass/40 flex items-center justify-center font-serif text-lg font-bold text-brass">
                      PP
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-ivory">
                        Adv. Priya Patel
                      </h3>
                      <div className="text-xs font-mono text-silver/70">
                        Partner • LL.B. (Hons) NLS
                      </div>
                      <div className="text-[10px] font-mono text-brass mt-0.5">
                        Bar No. G/2356/2012 • 14 Yrs Standing
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-silver/80 font-light leading-relaxed">
                    Leads the constitutional and appellate division. Renowned for constitutional writs, land title adjudications, RERA regulatory matters, and municipal town planning appeals.
                  </p>

                  <div className="mt-5 space-y-2 text-xs font-mono text-silver/80 pt-4 border-t border-slate/40">
                    <div className="flex justify-between">
                      <span className="text-silver/50">Admissions:</span>
                      <span className="text-ivory">High Court Bar Association</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver/50">Education:</span>
                      <span className="text-ivory">NLS Bangalore</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver/50">Specialization:</span>
                      <span className="text-brass">Writ Petitions & Land Title</span>
                    </div>
                  </div>
                </div>

                <MagneticButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveResumeTab('profile');
                    setResumeModalOpen(true);
                  }}
                  className="w-full text-xs font-mono uppercase tracking-wider"
                >
                  View Partner Profile
                </MagneticButton>
              </GlassCard>
            </Reveal>

            {/* Counsel 3: Adv Vikramaditya Desai */}
            <Reveal variant="fadeUp" delay={0.25}>
              <GlassCard className="p-7 space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3.5 pb-4 border-b border-brass/15">
                    <div className="w-12 h-12 rounded-xs bg-graphite border border-brass/40 flex items-center justify-center font-serif text-lg font-bold text-brass">
                      VD
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-ivory">
                        Adv. Vikramaditya Desai
                      </h3>
                      <div className="text-xs font-mono text-silver/70">
                        Associate Counsel • Trial Advocate
                      </div>
                      <div className="text-[10px] font-mono text-brass mt-0.5">
                        Bar No. G/3478/2015 • 11 Yrs Standing
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-silver/80 font-light leading-relaxed">
                    Trial specialist in economic offenses, corporate statutory defense, forensic financial evidence, and trial advocacy before Sessions Courts and Special CBI/ED Benches.
                  </p>

                  <div className="mt-5 space-y-2 text-xs font-mono text-silver/80 pt-4 border-t border-slate/40">
                    <div className="flex justify-between">
                      <span className="text-silver/50">Admissions:</span>
                      <span className="text-ivory">Sessions & High Court Benches</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver/50">Education:</span>
                      <span className="text-ivory">Government Law College</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silver/50">Focus:</span>
                      <span className="text-brass">Statutory Defense & Trial</span>
                    </div>
                  </div>
                </div>

                <MagneticButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveResumeTab('profile');
                    setResumeModalOpen(true);
                  }}
                  className="w-full text-xs font-mono uppercase tracking-wider"
                >
                  View Associate Profile
                </MagneticButton>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION V: STRATEGIC WORKFLOW (METHODOLOGY)
          ========================================================================= */}
      <section id="approach" className="py-24 px-4 sm:px-6 md:px-8 border-t border-brass/15 bg-ink">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            numeral="V"
            eyebrow="Process & Protocol"
            title="Strategic Legal Workflow"
            subtitle="A disciplined, repeatable process transforming complex legal disputes into clear outcomes."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting Brass Hairline Line for Desktop */}
            <div className="hidden md:block absolute top-10 left-12 right-12 h-[1px] bg-gradient-to-r from-brass/10 via-brass/40 to-brass/10 -z-0" />

            {methodology.map((m, idx) => (
              <Reveal key={m.step} variant="fadeUp" delay={idx * 0.1}>
                <div className="relative z-10 p-6 rounded-md bg-charcoal/70 border border-brass/20 flex flex-col justify-between h-full hover:border-brass/50 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-graphite border border-brass/40 flex items-center justify-center font-display text-sm font-semibold text-brass mb-4 shadow-md">
                      {m.step}
                    </div>

                    <h3 className="font-serif text-base font-semibold text-ivory mb-2">
                      {m.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-silver/70 font-light leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate/30 text-[11px] font-mono text-silver/40">
                    Phase {idx + 1} of 4
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRACTICE SUITE SECTION (WHY BRIEFCASE)
          ========================================================================= */}
      <section id="why-briefcase" className="py-20 px-4 sm:px-6 md:px-8 border-t border-brass/15 bg-charcoal/30">
        <div className="max-w-6xl mx-auto rounded-lg border border-brass/25 bg-gradient-to-br from-graphite/90 via-charcoal/95 to-ink p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brass/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
                Digital Chambers Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ivory font-medium">
                The BriefCase Management Platform
              </h2>
              <p className="text-silver/80 font-light leading-relaxed text-sm sm:text-base">
                Unlike traditional firms dependent on fragmented paperwork, BriefCase operates on a unified, high-security relational docket engine. Clients and counsel track court dates, filings, statutory limitations, and financial accounting with complete auditability.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-silver/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brass" />
                  <span>Real-time Hearing Registry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brass" />
                  <span>Role-Based Privilege Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brass" />
                  <span>Cryptographic Audit Trails</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link to="/login" className="w-full">
                <MagneticButton variant="brass" size="md" className="w-full text-xs font-mono uppercase tracking-wider">
                  Access Portal Login
                </MagneticButton>
              </Link>
              <Link to="/register" className="w-full">
                <MagneticButton variant="outline" size="md" className="w-full text-xs font-mono uppercase tracking-wider">
                  Create Counsel Account
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION VI: PRIVILEGED CONTACT & INQUIRY
          ========================================================================= */}
      <section id="contact" className="py-24 px-4 sm:px-6 md:px-8 border-t border-brass/15 bg-ink relative">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            numeral="VI"
            eyebrow="Privileged Communication"
            title="Consult Our Chambers"
            subtitle="Every case begins with a conversation. Inquiries are handled with the highest fiduciary discretion."
          />

          <GlassCard className="p-8 sm:p-10 shadow-2xl">
            {contactSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE_EXPO }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-ivory">
                  Privileged Inquiry Received
                </h3>
                <p className="text-silver/80 text-sm max-w-md mx-auto leading-relaxed">
                  Your communication has been encrypted and logged in our chambers intake docket. The registrar will respond within one judicial business day.
                </p>
                <div className="pt-4">
                  <MagneticButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactForm({
                        name: '',
                        email: '',
                        phone: '',
                        practiceArea: 'Civil Litigation',
                        message: ''
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </MagneticButton>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-2">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adv. Arvind Swaminathan"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="court-input w-full px-4 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="counsel@chambers.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="court-input w-full px-4 py-2.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-2">
                      Direct Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98250 00000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="court-input w-full px-4 py-2.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-2">
                      Practice Area of Matter
                    </label>
                    <select
                      value={contactForm.practiceArea}
                      onChange={(e) => setContactForm({ ...contactForm, practiceArea: e.target.value })}
                      className="court-input w-full px-4 py-2.5 font-mono text-xs bg-charcoal cursor-pointer"
                    >
                      <option value="Civil Litigation">Civil & Commercial Litigation</option>
                      <option value="Corporate Law">Corporate Advisory & Arbitration</option>
                      <option value="Criminal Defense">White-Collar & Trial Defense</option>
                      <option value="Real Estate">Real Estate & Constitutional Writs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-silver/80 mb-2">
                    Matter Summary & Cause of Action *
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Provide a confidential summary of the dispute, forum, and relief sought..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="court-input w-full px-4 py-2.5"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-silver/60">
                    <ShieldCheck className="w-4 h-4 text-brass" />
                    <span>Transmitted under privileged attorney-client confidentiality.</span>
                  </div>

                  <MagneticButton
                    type="submit"
                    variant="brass"
                    size="md"
                    className="w-full sm:w-auto uppercase font-mono tracking-wider text-xs"
                  >
                    Submit Privileged Inquiry
                  </MagneticButton>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </section>

      {/* =========================================================================
          FOOTER - Rich, Architectural & Structured
          ========================================================================= */}
      <footer className="border-t border-brass/20 bg-charcoal/95 pt-16 pb-12 px-4 sm:px-6 md:px-8 text-silver/80 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" />
            <p className="text-silver/70 font-light leading-relaxed max-w-sm text-xs mt-3">
              BriefCase Chambers provides trial advocacy, appellate counsel, and institutional arbitration representation before High Courts and tribunals.
            </p>
            <div className="pt-2 font-mono text-[11px] text-silver/60 space-y-1">
              <div>Chambers: 402-406 High Court Complex, Sector 10</div>
              <div>Direct: +91 79 2658 0000 • registrar@briefcasechambers.com</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <div className="uppercase tracking-widest text-ivory font-semibold mb-2">Practice</div>
            <div><a href="#firm" className="hover:text-brass transition-colors">Our Firm</a></div>
            <div><a href="#practice-areas" className="hover:text-brass transition-colors">Practice Areas</a></div>
            <div><a href="#resume" className="hover:text-brass transition-colors">Chambers Resume</a></div>
            <div><a href="#approach" className="hover:text-brass transition-colors">Strategic Workflow</a></div>
          </div>

          {/* Portal Links */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <div className="uppercase tracking-widest text-ivory font-semibold mb-2">Chambers Suite</div>
            <div><Link to="/login" className="hover:text-brass transition-colors">Counsel Login</Link></div>
            <div><Link to="/register" className="hover:text-brass transition-colors">Register Docket</Link></div>
            <div><button onClick={() => setResumeModalOpen(true)} className="hover:text-brass transition-colors text-left cursor-pointer">Official CV</button></div>
            <div><a href="#contact" className="hover:text-brass transition-colors">Inquiry Desk</a></div>
          </div>

          {/* Judicial Badges */}
          <div className="md:col-span-3 space-y-3 font-mono text-[11px] text-silver/70">
            <div className="uppercase tracking-widest text-ivory font-semibold mb-2">Enrolments</div>
            <div className="p-3 rounded-xs border border-brass/15 bg-graphite/40">
              <span className="text-ivory font-medium">Bar Council of Gujarat</span>
              <div className="text-[10px] text-silver/60">Roll No: G/1245/2005 (Continuous Standing)</div>
            </div>
            <div className="p-3 rounded-xs border border-brass/15 bg-graphite/40">
              <span className="text-ivory font-medium">Supreme Court Advocates</span>
              <div className="text-[10px] text-silver/60">Active Roster on Appellate Benches</div>
            </div>
          </div>
        </div>

        {/* Faded Large Brand Wordmark */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-brass/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <div>
            © 2026 BriefCase Chambers. All privileges and rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-silver/60">
            <button onClick={() => setResumeModalOpen(true)} className="hover:text-ivory cursor-pointer">
              Curriculum Vitae
            </button>
            <Link to="/login" className="hover:text-ivory">Portal</Link>
            <a href="#contact" className="hover:text-ivory">Consult</a>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          DETAILED CHAMBERS RESUME & CV MODAL
          ========================================================================= */}
      <AnimatePresence>
        {resumeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.35, ease: EASE_EXPO }}
              className="relative w-full max-w-3xl bg-graphite border border-brass/35 rounded-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ivory"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-brass/20 flex items-center justify-between bg-charcoal">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xs bg-graphite border border-brass/35 flex items-center justify-center text-brass">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-ivory">
                      Chambers Curriculum Vitae & Credentials
                    </h3>
                    <div className="text-[10px] font-mono text-silver/70 uppercase tracking-widest">
                      BriefCase Chambers • Official Practice Record
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setResumeModalOpen(false)}
                  className="p-1.5 rounded text-silver/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close CV Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-brass/15 bg-charcoal/80 px-6 text-xs font-mono">
                <button
                  onClick={() => setActiveResumeTab('profile')}
                  className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                    activeResumeTab === 'profile'
                      ? 'border-brass text-brass font-semibold'
                      : 'border-transparent text-silver/60 hover:text-ivory'
                  }`}
                >
                  Partners & Standing
                </button>
                <button
                  onClick={() => setActiveResumeTab('precedents')}
                  className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                    activeResumeTab === 'precedents'
                      ? 'border-brass text-brass font-semibold'
                      : 'border-transparent text-silver/60 hover:text-ivory'
                  }`}
                >
                  Landmark Precedents
                </button>
                <button
                  onClick={() => setActiveResumeTab('academics')}
                  className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                    activeResumeTab === 'academics'
                      ? 'border-brass text-brass font-semibold'
                      : 'border-transparent text-silver/60 hover:text-ivory'
                  }`}
                >
                  Admissions & Honors
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif text-ivory/90 leading-relaxed max-h-[60vh]">
                {activeResumeTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded bg-charcoal/90 border border-brass/20 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-base text-ivory">
                            Adv. Rajesh Mehta, LL.M. (Cantab)
                          </h4>
                          <div className="text-[11px] font-mono text-silver/70">
                            Senior Advocate • 21 Years Standing • Bar No. G/1245/2005
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brass/15 text-brass border border-brass/30">
                          Head of Chambers
                        </span>
                      </div>
                      <p className="text-xs text-silver/85 font-sans font-light">
                        Enrolled in 2005. Regularly briefed on high-stakes corporate disputes, insolvency proceedings, contractual arbitrations, and special leave petitions. Represented Fortune 500 multinationals and municipal statutory boards in over 1,200 dockets.
                      </p>
                    </div>

                    <div className="p-4 rounded bg-charcoal/90 border border-brass/20 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-base text-ivory">
                            Adv. Priya Patel, LL.B. (Hons) NLS
                          </h4>
                          <div className="text-[11px] font-mono text-silver/70">
                            Partner • 14 Years Standing • Bar No. G/2356/2012
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brass/15 text-brass border border-brass/30">
                          Appellate & Constitutional
                        </span>
                      </div>
                      <p className="text-xs text-silver/85 font-sans font-light">
                        National Law School graduate with expertise in property rights, land acquisition writs, environmental law disputes, and succession disputes before High Court Division Benches.
                      </p>
                    </div>
                  </div>
                )}

                {activeResumeTab === 'precedents' && (
                  <div className="space-y-3 font-sans">
                    <div className="p-4 bg-charcoal/90 border border-brass/20 rounded">
                      <div className="font-mono text-ivory text-xs font-semibold">
                        Sterling Logistics vs. Port Infrastructure Corp (2024)
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        High Court Commercial Division • Favorable Injunction Secured
                      </div>
                      <p className="mt-2 text-xs text-silver/80 font-light">
                        Successfully established breach of tender covenants and protected ₹42 Cr in maritime infrastructure assets through emergency interim relief.
                      </p>
                    </div>

                    <div className="p-4 bg-charcoal/90 border border-brass/20 rounded">
                      <div className="font-mono text-ivory text-xs font-semibold">
                        M/s Horizon Developers vs. Municipal Corporation (2023)
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        Commercial Division Bench • Decree in Favor of Client
                      </div>
                      <p className="mt-2 text-xs text-silver/80 font-light">
                        Argued landmark interpretation of building bylaws, setting a precedent in developmental transferable rights.
                      </p>
                    </div>
                  </div>
                )}

                {activeResumeTab === 'academics' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 bg-charcoal/90 border border-brass/20 rounded flex items-center justify-between">
                      <div>
                        <div className="text-ivory font-semibold">Supreme Court Bar Association (SCBA)</div>
                        <div className="text-silver/60 text-[11px]">Active Member in Good Standing</div>
                      </div>
                      <Award className="w-5 h-5 text-brass" />
                    </div>

                    <div className="p-3.5 bg-charcoal/90 border border-brass/20 rounded flex items-center justify-between">
                      <div>
                        <div className="text-ivory font-semibold">Bar Council of Gujarat & Advocates Association</div>
                        <div className="text-silver/60 text-[11px]">Enrolled 2005 • Continuous Practice Record</div>
                      </div>
                      <Award className="w-5 h-5 text-brass" />
                    </div>

                    <div className="p-3.5 bg-charcoal/90 border border-brass/20 rounded flex items-center justify-between">
                      <div>
                        <div className="text-ivory font-semibold">Chartered Institute of Arbitrators (CIArb)</div>
                        <div className="text-silver/60 text-[11px]">Fellowship Credential in Commercial Dispute Resolution</div>
                      </div>
                      <Award className="w-5 h-5 text-brass" />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-brass/20 bg-charcoal flex items-center justify-between">
                <span className="text-[11px] font-mono text-silver/60">
                  Chambers Profile • Verified Record
                </span>
                <MagneticButton
                  variant="brass"
                  size="sm"
                  onClick={handleDownloadResume}
                  icon={Download}
                  iconPosition="left"
                  className="text-xs font-mono uppercase tracking-wider"
                >
                  Print / Save CV
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
