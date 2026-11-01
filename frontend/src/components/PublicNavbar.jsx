import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { EASE_EXPO } from '../lib/motion';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Transparent vs blurred glass threshold
      setScrolled(currentScrollY > 30);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY && !mobileMenuOpen) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  const navLinks = [
    { name: 'Our Firm', href: '#firm' },
    { name: 'Practice Areas', href: '#practice-areas' },
    { name: 'Chambers Resume', href: '#resume' },
    { name: 'Strategic Workflow', href: '#approach' },
    { name: 'Our Counsel', href: '#lawyers' },
    { name: 'Practice Suite', href: '#why-briefcase' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform ${
          visible ? 'translate-y-0' : '-translate-y-full'
        } ${
          scrolled
            ? 'bg-charcoal/85 backdrop-blur-xl border-b border-brass/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
            : 'bg-gradient-to-b from-ink/90 via-ink/40 to-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link to="/" className="outline-none focus-visible:ring-2 focus-visible:ring-brass rounded-sm">
            <Logo size="md" />
          </Link>

          {/* Desktop Public Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-xs font-mono uppercase tracking-[0.18em] text-silver/80 hover:text-ivory transition-colors relative py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-brass to-brass-light transition-all duration-250 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right CTA Actions */}
          <div className="hidden sm:flex items-center space-x-3.5">
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, '#contact')}
              className="text-xs font-mono uppercase tracking-wider text-silver hover:text-ivory px-3.5 py-2 transition-colors"
            >
              Consultation
            </a>

            <Link
              to="/login"
              className="court-btn-brass inline-flex items-center space-x-2 px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider shadow-md group"
            >
              <span>Chambers Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xs text-ivory border border-brass/25 hover:border-brass/60 bg-charcoal/90 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Elegant Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE_EXPO }}
            className="fixed inset-0 top-[60px] z-30 lg:hidden bg-ink/95 backdrop-blur-2xl border-t border-brass/20 flex flex-col justify-between p-6 overflow-y-auto"
          >
            <div className="flex flex-col space-y-1 mt-4">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="text-lg font-serif text-ivory hover:text-brass py-3 border-b border-slate/30 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-brass/60" />
                </motion.a>
              ))}
            </div>

            <div className="pt-6 pb-8 flex flex-col space-y-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 court-btn-brass font-medium text-xs font-mono uppercase tracking-wider rounded-xs shadow-lg"
              >
                Enter Chambers Portal
              </Link>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="w-full text-center py-3 court-btn-outline text-xs font-mono uppercase tracking-wider rounded-xs"
              >
                Schedule Private Consultation
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
