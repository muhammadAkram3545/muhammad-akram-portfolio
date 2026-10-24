import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ArrowRight, VolumeX } from 'lucide-react';

export const OpeningExperience: React.FC = () => {
  const { data, isIntroActive, skipIntro } = usePortfolio();
  const [phase, setPhase] = useState<'monogram' | 'name' | 'roles' | 'exit'>('monogram');
  const [progress, setProgress] = useState(0);

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    if (!isIntroActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipIntro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntroActive, skipIntro]);

  // Phase transitions
  useEffect(() => {
    if (!isIntroActive) return;

    const t1 = setTimeout(() => setPhase('name'), 600);
    const t2 = setTimeout(() => setPhase('roles'), 1400);
    const t3 = setTimeout(() => setPhase('exit'), 2400);
    const t4 = setTimeout(() => {
      skipIntro();
    }, 2800);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 3.8;
      });
    }, 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [isIntroActive, skipIntro]);

  if (!isIntroActive) return null;

  return (
    <div
      role="dialog"
      aria-label="Portfolio Introduction"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-[#f0f4f8] transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Micro Precision Grid & Ambient Aura */}
      <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Subtle Central Geometric Frame */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto">
        {/* Monogram emblem */}
        <div
          className={`w-16 h-16 mb-8 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center transition-all duration-700 ${
            phase !== 'exit' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <span className="font-heading text-xl font-bold tracking-wider text-sky-400">
            {data.intro.brandMonogram}
          </span>
        </div>

        {/* Name Reveal */}
        <div className="overflow-hidden mb-3">
          <h1
            className={`font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight transition-all duration-700 ease-out ${
              phase === 'name' || phase === 'roles' || phase === 'exit'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            {data.personal.fullName}
          </h1>
        </div>

        {/* Roles & Specialty Reveal */}
        <div className="overflow-hidden min-h-[32px] flex items-center justify-center">
          <p
            className={`text-sm sm:text-base text-slate-400 transition-all duration-700 delay-100 ${
              phase === 'roles' || phase === 'exit'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-6 opacity-0'
            }`}
          >
            <span className="text-slate-300">Web Developer</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-300">UI/UX Designer</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-sky-400 font-medium">AI Solutions</span>
          </p>
        </div>

        {/* Micro Linear Progress Indicator */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full mt-10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-100 ease-linear"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Top / Bottom Action Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={skipIntro}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors cursor-pointer"
          title="Press Esc to Skip"
        >
          <span>Skip Intro</span>
          <span className="text-[10px] text-slate-500 font-mono px-1 py-0.5 bg-black/40 rounded border border-white/5">
            ESC
          </span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      <div className="absolute bottom-6 left-6 text-xs text-slate-500 font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Initializing portfolio experience</span>
      </div>
    </div>
  );
};
