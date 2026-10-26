import React, { useState } from 'react';
import Logo from './Logo';
import {
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  X,
  Compass,
  Scale
} from 'lucide-react';

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
      title: 'Executive Analytics & SQL Lab',
      icon: BarChart3,
      badge: 'Analytics Engine',
      desc: 'Query execution engine featuring correlated subqueries, relational joins, aggregate financial analytics, and view materialization.'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl court-card-elevated overflow-hidden shadow-2xl">
        {/* Gold hairline top accent */}
        <div className="court-hairline" />

        {/* Close Button */}
        <button
          onClick={handleFinish}
          className="absolute top-3.5 right-3.5 p-1.5 text-[#6B6F76] hover:text-white rounded-[3px] hover:bg-[#1E1F23] transition-colors cursor-pointer"
          title="Dismiss Orientation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-[3px] bg-[#141416] border border-[#B8975A]/40 flex items-center justify-center text-[#D4B97E]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] block">
                Chambers Orientation
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-white font-semibold">
                Welcome to BriefCase, {userName}
              </h2>
            </div>
          </div>

          <p className="text-xs text-[#B4B7BC] mb-4 font-sans leading-relaxed">
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
                  className={`p-3 rounded-[3px] border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#1E1F23] border-[#B8975A]/50 shadow-[0_0_12px_rgba(184,151,90,0.15)]'
                      : 'bg-[#141416] border-[#2B2D32] hover:border-[#B8975A]/30'
                  }`}
                >
                  <div className={`p-2 rounded-[2px] ${isSelected ? 'bg-gradient-to-br from-[#D4B97E] to-[#B8975A] text-[#0A0A0B]' : 'bg-[#0A0A0B] text-[#B8975A]'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-serif font-semibold truncate ${isSelected ? 'text-white' : 'text-[#B4B7BC]'}`}>
                        {m.title}
                      </h4>
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-[2px] ml-2 border ${
                        isSelected
                          ? 'bg-[#B8975A]/20 text-[#D4B97E] border-[#B8975A]/40'
                          : 'bg-[#0A0A0B] text-[#6B6F76] border-[#2B2D32]'
                      }`}>
                        {m.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <p className="text-[11px] text-[#B4B7BC] font-sans mt-1 leading-relaxed">
                        {m.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#2B2D32] text-xs">
            <div className="flex gap-1.5">
              {modules.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === step ? 'w-5 bg-[#B8975A]' : 'w-1.5 bg-[#2B2D32] hover:bg-[#6B6F76]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="court-btn-brass px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow"
            >
              <span>Enter Practice Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
