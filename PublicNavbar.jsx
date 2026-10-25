import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Our Firm', href: '#firm' },
    { name: 'Practice Areas', href: '#practice-areas' },
    { name: 'Chambers Resume', href: '#resume' },
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
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#150f0b]/95 backdrop-blur-md border-b border-white/10 py-3 shadow-xl shadow-black/50'
          : 'bg-gradient-to-b from-[#150f0b]/90 via-[#150f0b]/50 to-transparent py-4 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link to="/" className="outline-none">
          <Logo size="md" />
        </Link>

        {/* Desktop Public Navigation */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-xs font-mono uppercase tracking-[0.16em] text-[#f5f0e7]/75 hover:text-white transition-colors relative py-1 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#f5f0e7] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="text-xs font-mono uppercase tracking-wider text-[#f5f0e7]/80 hover:text-white px-3 py-2 transition-colors"
          >
            Get in Touch
          </a>

          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#150f0b] rounded-sm text-xs font-mono font-medium uppercase tracking-wider transition-all duration-200 shadow-md group hover:scale-[1.02]"
          >
            <span>Client Portal</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#150f0b] transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded text-[#f5f0e7] border border-white/10 hover:border-white/30 bg-[#241b15]/80 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1c1510] border-b border-white/10 px-5 py-5 shadow-2xl transition-all">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-serif text-[#f5f0e7] hover:text-white py-1.5 border-b border-white/5 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-[#f5f0e7]/50" />
              </a>
            ))}

            <div className="pt-3 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-[#f5f0e7] text-[#150f0b] font-medium text-xs font-mono uppercase tracking-wider rounded-sm shadow-md"
              >
                Client Portal Login
              </Link>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="w-full text-center py-2 border border-white/10 text-[#f5f0e7]/80 text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-white/5"
              >
                Request Consultation
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
