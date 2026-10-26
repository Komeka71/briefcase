import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X, ArrowRight, ChevronRight, Scale } from 'lucide-react';

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
          ? 'bg-[#0A0A0B]/95 backdrop-blur-md border-b border-[#2B2D32] py-3 shadow-xl shadow-black/60'
          : 'bg-gradient-to-b from-[#0A0A0B]/90 via-[#0A0A0B]/40 to-transparent py-4 border-b border-transparent'
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
              className="text-xs font-mono uppercase tracking-[0.16em] text-[#B4B7BC] hover:text-[#D4B97E] transition-colors relative py-1 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#B8975A] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="text-xs font-mono uppercase tracking-wider text-[#B4B7BC] hover:text-white px-3 py-2 transition-colors"
          >
            Get in Touch
          </a>

          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-3.5 py-2 court-btn-brass rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all duration-200 shadow-md group hover:scale-[1.02]"
          >
            <span>Chambers Portal</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B] transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded text-[#F6F4EF] border border-[#2B2D32] hover:border-[#B8975A]/50 bg-[#141416] transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141416] border-b border-[#2B2D32] px-5 py-5 shadow-2xl transition-all animate-fadeIn">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-serif text-[#F6F4EF] hover:text-[#D4B97E] py-1.5 border-b border-[#2B2D32]/60 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-[#6B6F76]" />
              </a>
            ))}

            <div className="pt-3 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 court-btn-brass font-medium text-xs font-mono uppercase tracking-wider rounded-[3px] shadow-md"
              >
                Chambers Portal Login
              </Link>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="w-full text-center py-2 court-btn-outline text-xs font-mono uppercase tracking-wider rounded-[3px]"
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
