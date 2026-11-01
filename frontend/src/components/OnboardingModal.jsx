import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  X,
  Compass
} from 'lucide-react';
import { EASE_EXPO } from '../lib/motion';

export default function OnboardingModal({ isOpen, onClose, userName = 'Counsel' }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const modules = [
    {
      title: 'Clients & Institutional Records',
      icon: Users,
      badge: 'Core Registry',
      desc: 'Centralized registry supporting pagination, stored procedure cursor iteration, and XML data interchange.'
    },
    {
      title: 'Active Case Dockets',
      icon: Briefcase,
      badge: 'Litigation Hub',
      desc: 'Complete tracking of corporate, civil, criminal, and constitutional matters with budget analysis and court associations.'
    },
    {
      title: 'Court Hearings & Cause Lists',
      icon: Calendar,
      badge: 'Bench Docket',
      desc: 'Synchronized cause lists for High Courts and District Benches with bench orders, room tracking, and next appearance dates.'
    },
    {
      title: 'Executive Analytics & Reports',
      icon: BarChart3,
      badge: 'Analytics Engine',
      desc: 'Comprehensive reporting engine featuring cross-entity relational queries, aggregate financial analytics, and practice views.'
    },
    {
      title: 'Role-Based Access & Forensic Audit',
      icon: Shield,
      badge: 'Chambers Security',
      desc: 'Granular security with bcrypt-secured logins, stored procedure execution, and immutable trigger audit logs capturing every table mutation.'
    }
  ];

  const handleFinish = () => {
    localStorage.setItem('briefcase_onboarded', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.35, ease: EASE_EXPO }}
          className="relative w-full max-w-xl rounded-md border border-brass/30 bg-charcoal shadow-2xl overflow-hidden text-ivory"
        >
          {/* Gold hairline top accent */}
          <div className="court-hairline" />

          {/* Close Button */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 p-1.5 text-silver/60 hover:text-ivory rounded-xs hover:bg-graphite transition-colors cursor-pointer"
            title="Dismiss Orientation"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content Area */}
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xs bg-graphite border border-brass/35 flex items-center justify-center text-brass shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-brass block">
                  Chambers Orientation
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-ivory font-medium">
                  Welcome to BriefCase, {userName}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-silver/80 mb-5 font-sans font-light leading-relaxed">
              Your chambers practice management suite is synchronized. Explore the primary operational modules below:
            </p>

            {/* Module Step View */}
            <div className="space-y-2 mb-6">
              {modules.map((m, idx) => {
                const Icon = m.icon;
                const isSelected = idx === step;
                return (
                  <div
                    key={m.title}
                    onClick={() => setStep(idx)}
                    className={`p-3.5 rounded-xs border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-graphite border-brass/50 shadow-[0_0_16px_rgba(184,151,90,0.15)]'
                        : 'bg-charcoal/80 border-slate/40 hover:border-brass/30'
                    }`}
                  >
                    <div className={`p-2 rounded-xs shrink-0 ${isSelected ? 'bg-gradient-to-br from-brass-light to-brass text-ink font-semibold' : 'bg-graphite text-brass border border-brass/20'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs sm:text-sm font-serif font-medium truncate ${isSelected ? 'text-ivory' : 'text-silver'}`}>
                          {m.title}
                        </h4>
                        <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-xs ml-2 border ${
                          isSelected
                            ? 'bg-brass/15 text-brass border-brass/30'
                            : 'bg-graphite text-silver/60 border-slate/40'
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <p className="text-xs text-silver/80 font-sans font-light mt-1.5 leading-relaxed">
                          {m.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-brass/15 text-xs">
              <div className="flex gap-2">
                {modules.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === step ? 'w-6 bg-brass' : 'w-1.5 bg-slate hover:bg-steel'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleFinish}
                className="court-btn-brass px-4 py-2 rounded-xs text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Enter Chambers</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
