import React, { useState } from 'react';
import Logo from './Logo';
import {
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, userName = 'Counsel' }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const modules = [
    {
      title: 'Clients & Institutional Records',
      icon: Users,
      badge: 'Core Registry',
      desc: 'Centralized registry supporting pagination, cursor-based batch iteration, and XML data interchange.'
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
      desc: 'Synchronized cause lists for High Courts and District Sessions with bench orders, room tracking, and next appearance dates.'
    },
    {
      title: 'Executive Analytics & Reports',
      icon: BarChart3,
      badge: 'Intelligence',
      desc: 'Query execution engine featuring correlated subqueries, relational joins, aggregate financial analytics, and view materialization.'
    },
    {
      title: 'Role-Based Access & Audit',
      icon: Shield,
      badge: 'Chambers Security',
      desc: 'Granular security with bcrypt-secured logins, stored procedure execution, and immutable audit logs capturing every table mutation.'
    }
  ];

  const handleFinish = () => {
    localStorage.setItem('briefcase_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b14]/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0a0f1d] border border-white/15 rounded-sm shadow-2xl overflow-hidden">
        {/* Subtle decorative top hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#1e293b] via-[#f5f0e7] to-[#1e293b]" />

        {/* Close Button */}
        <button
          onClick={handleFinish}
          className="absolute top-3.5 right-3.5 p-1.5 text-[#f5f0e7]/60 hover:text-white rounded-sm hover:bg-white/10 transition-colors"
          title="Dismiss Orientation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-sm bg-[#121c33] border border-white/20 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#f5f0e7]/70 block">
                Practice Orientation
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-white">
                Welcome to BriefCase, {userName}
              </h2>
            </div>
          </div>

          <p className="text-xs text-[#f5f0e7]/75 mb-4 font-sans leading-relaxed">
            Your chambers practice management suite is fully synchronized. Explore the primary operational modules below:
          </p>

          {/* Module Carousel / Step View */}
          <div className="space-y-2 mb-6">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              const isSelected = idx === step;
              return (
                <div
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`p-3 rounded-sm border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#121c33] border-white/30 shadow-md'
                      : 'bg-[#0d1527] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`p-2 rounded-sm ${isSelected ? 'bg-white text-[#070b14]' : 'bg-[#070b14] text-white/70'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-serif font-semibold truncate ${isSelected ? 'text-white' : 'text-[#f5f0e7]/80'}`}>
                        {m.title}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#070b14] text-[#f5f0e7]/70 border border-white/10 ml-2">
                        {m.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <p className="text-[11px] text-[#f5f0e7]/70 font-sans mt-1 leading-relaxed">
                        {m.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <div className="flex gap-1.5">
              {modules.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'w-5 bg-white' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-[#f5f0e7] hover:bg-white text-[#070b14] text-xs font-mono font-medium uppercase tracking-wider rounded-sm transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Enter Practice Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#070b14]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
