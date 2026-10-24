import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { resolveElementStyles } from '../../utils/styleResolver';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { ArrowDownRight, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const {
    data,
    isStudioRoute,
    isStudioPreviewMode,
    studioViewport,
    selectedElement,
    setSelectedElement
  } = usePortfolio();

  const [roleIndex, setRoleIndex] = useState(0);

  // Name separation into exact uppercase words
  const rawFullName = (data.personal.fullName || 'Muhammad Akram').trim();
  const nameParts = rawFullName.split(/\s+/);
  const targetFirst = (nameParts[0] || 'Muhammad').toUpperCase(); // "MUHAMMAD"
  const targetLast = (nameParts.slice(1).join(' ') || 'Akram').toUpperCase(); // "AKRAM"

  // Entrance and typing animation states
  const [displayedFirst, setDisplayedFirst] = useState('');
  const [displayedLast, setDisplayedLast] = useState('');
  const [isTypingFirstDone, setIsTypingFirstDone] = useState(false);
  const [isNameAnimationComplete, setIsNameAnimationComplete] = useState(false);
  const [isPortraitEntering, setIsPortraitEntering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Mouse tracking for yellow spotlight text effect
  const [nameMouse, setNameMouse] = useState<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });
  const nameContainerRef = useRef<HTMLDivElement>(null);

  const updateNameMousePosition = (clientX: number, clientY: number) => {
    if (!nameContainerRef.current) return;
    const rect = nameContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Active if pointer is inside or within 60px padding of the name bounds
    const isNear =
      x >= -60 &&
      x <= rect.width + 60 &&
      y >= -50 &&
      y <= rect.height + 50;

    if (isNear) {
      setNameMouse({ x, y, active: true });
    } else {
      setNameMouse(prev => (prev.active ? { ...prev, active: false } : prev));
    }
  };

  // Subtle 3D portrait tilt tracking pointer direction
  const tiltRef = useRef({
    currentRotateX: 0,
    currentRotateY: 0,
    currentTranslateX: 0,
    currentTranslateY: 0,
    targetRotateX: 0,
    targetRotateY: 0,
    targetTranslateX: 0,
    targetTranslateY: 0,
  });

  const [portraitTiltTransform, setPortraitTiltTransform] = useState<string>(
    'perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)'
  );

  useEffect(() => {
    // Disable pointer tracking on touch devices and respect prefers-reduced-motion
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReduced) {
      return;
    }

    let animationFrameId: number;
    let isRunning = true;

    const updateTilt = () => {
      if (!isRunning) return;
      const t = tiltRef.current;
      const factor = 0.08;

      t.currentRotateX += (t.targetRotateX - t.currentRotateX) * factor;
      t.currentRotateY += (t.targetRotateY - t.currentRotateY) * factor;
      t.currentTranslateX += (t.targetTranslateX - t.currentTranslateX) * factor;
      t.currentTranslateY += (t.targetTranslateY - t.currentTranslateY) * factor;

      const diff =
        Math.abs(t.targetRotateX - t.currentRotateX) +
        Math.abs(t.targetRotateY - t.currentRotateY) +
        Math.abs(t.targetTranslateX - t.currentTranslateX) +
        Math.abs(t.targetTranslateY - t.currentTranslateY);

      if (diff > 0.001) {
        setPortraitTiltTransform(
          `perspective(1200px) rotateX(${t.currentRotateX.toFixed(2)}deg) rotateY(${t.currentRotateY.toFixed(2)}deg) translate3d(${t.currentTranslateX.toFixed(1)}px, ${t.currentTranslateY.toFixed(1)}px, 0)`
        );
      }

      animationFrameId = requestAnimationFrame(updateTilt);
    };

    animationFrameId = requestAnimationFrame(updateTilt);

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.45;

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));

      // Subtle directional tilt toward pointer:
      // Moving right -> rotates Y right (+deg), moving left -> rotates Y left (-deg)
      // Moving down -> tilts X down (-deg), moving up -> tilts X up (+deg)
      const maxRotY = 4.2; // degrees
      const maxRotX = 3.0; // degrees
      const maxTransX = 5.0; // px
      const maxTransY = 3.5; // px

      tiltRef.current.targetRotateY = normX * maxRotY;
      tiltRef.current.targetRotateX = -normY * maxRotX;
      tiltRef.current.targetTranslateX = normX * maxTransX;
      tiltRef.current.targetTranslateY = normY * maxTransY;
    };

    const handleMouseLeave = () => {
      tiltRef.current.targetRotateX = 0;
      tiltRef.current.targetRotateY = 0;
      tiltRef.current.targetTranslateX = 0;
      tiltRef.current.targetTranslateY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Step 1: Smooth letter-by-letter build animation for MUHAMMAD and AKRAM
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayedFirst(targetFirst);
      setDisplayedLast(targetLast);
      setIsTypingFirstDone(true);
      setIsNameAnimationComplete(true);
      setIsPortraitEntering(true);
      setHasEntered(true);
      return;
    }

    setDisplayedFirst('');
    setDisplayedLast('');
    setIsTypingFirstDone(false);
    setIsNameAnimationComplete(false);
    setIsPortraitEntering(false);
    setHasEntered(false);

    let firstIndex = 0;
    // Phase 1: Type MUHAMMAD (guarantees every letter, including D, is typed)
    const firstInterval = setInterval(() => {
      firstIndex++;
      if (firstIndex <= targetFirst.length) {
        setDisplayedFirst(targetFirst.slice(0, firstIndex));
      } else {
        clearInterval(firstInterval);
        setIsTypingFirstDone(true);

        // Phase 2: Type AKRAM
        let lastIndex = 0;
        const lastInterval = setInterval(() => {
          lastIndex++;
          if (lastIndex <= targetLast.length) {
            setDisplayedLast(targetLast.slice(0, lastIndex));
          } else {
            clearInterval(lastInterval);
            setIsNameAnimationComplete(true);
          }
        }, 40);
      }
    }, 45);

    return () => {
      clearInterval(firstInterval);
    };
  }, [targetFirst, targetLast]);

  // Step 2: Smooth upward entrance of portrait ONLY after name animation finishes
  useEffect(() => {
    if (isNameAnimationComplete) {
      // Small pause (200ms) after name is completely finished so user sees full name
      const enterTimer = setTimeout(() => {
        setIsPortraitEntering(true);
      }, 200);

      // Once portrait finishes rising into position (1.1s later), activate natural scroll departure
      const completeTimer = setTimeout(() => {
        setHasEntered(true);
      }, 1300);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setIsPortraitEntering(false);
      setHasEntered(false);
    }
  }, [isNameAnimationComplete]);

  // Track window scroll for natural interactive scroll-down / scroll-up profile behavior
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cycling professional title
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % data.personal.roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [data.personal.roles.length]);

  const isHeadlineSelected = selectedElement?.id === 'hero-headline';
  const isBioSelected = selectedElement?.id === 'hero-bio';
  const isAvatarSelected = selectedElement?.id === 'hero-avatar';

  const headingStyles = resolveElementStyles(data.personal.headingStyle, studioViewport);
  const bioStyles = resolveElementStyles(data.personal.bioStyle, studioViewport);
  const avatarStyles = resolveElementStyles(data.personal.avatarStyle, studioViewport);

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;

  // Actual editable hero background image from existing Media Library / data system
  const heroBgImage = resolveAssetUrl(
    data.personal.heroBackgroundImageUrl ||
    '/assets/images/cinematic_hero_workspace_backdrop_1791557662832.jpg'
  );

  // Responsive scroll offset & fade for natural departure
  const scrollOffset = Math.min(scrollY * 0.65, 450);
  const scrollFade = Math.max(0, 1 - scrollY / 380);

  // Dynamic positioning for initial entrance and scroll departure:
  // Starts hidden at translateY(300px) and opacity 0 while name is animating
  // Smoothly rises to translateY(0) and opacity 1 once name completes
  // Naturally moves down and fades on scroll
  const avatarTranslateY = !isPortraitEntering
    ? 300
    : hasEntered
    ? scrollOffset
    : 0;

  const avatarOpacity = !isPortraitEntering
    ? 0
    : hasEntered
    ? scrollFade
    : 1;

  const avatarTransition = !isPortraitEntering
    ? 'none'
    : hasEntered
    ? 'transform 0.06s linear, opacity 0.1s linear'
    : 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease-out';

  // High-fidelity portrait (supports PNG, JPG, WebP, SVG, and Supabase / cloud storage URLs)
  const portraitUrl = resolveAssetUrl(
    data.personal.heroPortraitUrl && data.personal.heroPortraitUrl.trim().length > 0
      ? data.personal.heroPortraitUrl.trim()
      : data.personal.avatarUrl && data.personal.avatarUrl.trim().length > 0
      ? data.personal.avatarUrl.trim()
      : '/assets/images/akram_hero_cutout_portrait.png'
  );

  return (
    <section
      id="home"
      className="relative min-h-screen min-h-[100svh] flex flex-col justify-between overflow-hidden pt-20 pb-6"
    >
      {/* 1. Full-Screen Visual Banner Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBgImage}
          alt="Workspace Visual Banner"
          className="w-full h-full object-cover object-center filter brightness-[0.34] contrast-[1.12] scale-[1.02]"
        />
        {/* Cinematic gradient overlays creating depth & seamless integration */}
        <div className="hero-banner-overlay absolute inset-0 bg-gradient-to-b from-[#090b10] via-[#090b10]/60 to-[#090b10]" />
        {/* Radial ambient lighting: subtle warm gold and cool cyan volumetric glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[650px] bg-gradient-to-r from-amber-500/12 via-sky-500/10 to-amber-500/6 blur-[160px] pointer-events-none rounded-full" />
        {/* Subtle geometric precision grid overlay */}
        <div className="absolute inset-0 bg-grid-subtle opacity-20" />
      </div>

      {/* 2. Top Header Bar inside Hero: Availability & Remote Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-30 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div
            onClick={(e) => {
              if (canSelectInStudio) {
                e.stopPropagation();
                setSelectedElement({
                  type: 'contact',
                  id: 'sec-contact',
                  label: 'Availability & Contact Status',
                  breadcrumbs: [
                    { id: 'home', label: 'Home', type: 'section' },
                    { id: 'sec-hero', label: 'Hero', type: 'section' },
                    { id: 'sec-contact', label: 'Availability', type: 'contact' }
                  ]
                });
              }
            }}
            className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-xs font-mono text-slate-300 shadow-sm transition-all ${
              canSelectInStudio ? 'cursor-pointer hover:bg-white/[0.08]' : ''
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-200 font-medium">{data.personal.availabilityNote}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400">{data.personal.location || 'Remote & Worldwide'}</span>
          </div>

          {/* Core Discipline Quick Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">Junior Web Developer</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span>WordPress & Shopify Developer</span>
          </div>
        </div>
      </div>

      {/* 3. CENTER MONUMENTAL COMPOSITION: Stacked Oversized Typography with Overlapping Centered Cutout Portrait */}
      <div
        onMouseMove={(e) => {
          updateNameMousePosition(e.clientX, e.clientY);
        }}
        onMouseLeave={() => {
          setNameMouse(prev => (prev.active ? { ...prev, active: false } : prev));
        }}
        className="relative w-full flex-1 flex items-center justify-center min-h-[58vh] sm:min-h-[66vh] lg:min-h-[72vh] overflow-hidden my-auto"
      >
        {/* Layer 1 (Behind Portrait - z-10): Monumental Stacked Name Typography Wall */}
        <div
          ref={nameContainerRef}
          onClick={(e) => {
            if (canSelectInStudio) {
              e.stopPropagation();
              setSelectedElement({
                type: 'hero',
                id: 'hero-headline',
                label: 'Hero Headline & Name',
                breadcrumbs: [
                  { id: 'home', label: 'Home', type: 'section' },
                  { id: 'sec-hero', label: 'Hero', type: 'section' },
                  { id: 'hero-headline', label: 'Headline', type: 'hero' }
                ]
              });
            }
          }}
          onMouseMove={(e) => {
            updateNameMousePosition(e.clientX, e.clientY);
          }}
          style={headingStyles}
          className={`absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-auto select-none px-2 sm:px-4 ${
            isHeadlineSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] rounded-xl' : ''
          }`}
        >
          <div className="relative w-full flex flex-col items-center justify-center">
            {/* Base Monumental Typography (Cream / White Editorial Gradient) */}
            <h1 className="w-full flex flex-col items-center justify-center font-heading font-black uppercase select-none cursor-default text-center">
              {/* Row 1: MUHAMMAD */}
              <div className="relative inline-flex items-center justify-center px-4 sm:px-6 md:px-8 max-w-full overflow-visible">
                <span className="block text-[clamp(1.85rem,8.6vw,8.5rem)] tracking-[-0.025em] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#f1f5f9] to-[#94a3b8]/40 whitespace-nowrap overflow-visible">
                  {isNameAnimationComplete ? targetFirst : displayedFirst}
                  {!isTypingFirstDone && !isNameAnimationComplete && (
                    <span className="inline-block w-2 sm:w-3 md:w-3.5 h-[0.7em] bg-amber-400 ml-2 animate-pulse align-middle shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
                  )}
                </span>
              </div>

              {/* Balanced, clearly visible gap between MUHAMMAD and AKRAM */}
              <div className="h-2.5 sm:h-3.5 md:h-4 lg:h-5 w-full pointer-events-none" />

              {/* Row 2: AKRAM */}
              <div className="relative inline-flex items-center justify-center px-4 sm:px-6 md:px-8 max-w-full overflow-visible">
                <span className="block text-[clamp(2.1rem,9.6vw,9.5rem)] tracking-[-0.025em] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-[#f8fafc] via-[#cbd5e1] to-[#64748b]/30 whitespace-nowrap overflow-visible">
                  {isNameAnimationComplete ? targetLast : displayedLast}
                  {isTypingFirstDone && !isNameAnimationComplete && (
                    <span className="inline-block w-2 sm:w-3 md:w-3.5 h-[0.7em] bg-amber-400 ml-2 animate-pulse align-middle shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
                  )}
                </span>
              </div>
            </h1>

            {/* Spotlight Yellow Overlay (Follows Mouse Across Name Smoothly) */}
            <h1
              aria-hidden="true"
              style={{
                maskImage: nameMouse.active
                  ? `radial-gradient(circle 160px at ${nameMouse.x}px ${nameMouse.y}px, black 30%, transparent 100%)`
                  : 'none',
                WebkitMaskImage: nameMouse.active
                  ? `radial-gradient(circle 160px at ${nameMouse.x}px ${nameMouse.y}px, black 30%, transparent 100%)`
                  : 'none',
                opacity: nameMouse.active ? 1 : 0,
                transition: nameMouse.active ? 'opacity 0.15s ease-out' : 'opacity 0.35s ease-out',
              }}
              className="hero-yellow-overlay absolute inset-0 w-full flex flex-col items-center justify-center font-heading font-black uppercase select-none pointer-events-none text-center"
            >
              {/* Row 1: MUHAMMAD Yellow Spotlight */}
              <div className="relative inline-flex items-center justify-center px-4 sm:px-6 md:px-8 max-w-full overflow-visible">
                <span className="hero-name-yellow-spotlight block text-[clamp(1.85rem,8.6vw,8.5rem)] tracking-[-0.025em] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 drop-shadow-[0_0_30px_rgba(250,204,21,0.9)] whitespace-nowrap overflow-visible">
                  {isNameAnimationComplete ? targetFirst : displayedFirst}
                </span>
              </div>

              {/* Balanced, clearly visible gap */}
              <div className="h-2.5 sm:h-3.5 md:h-4 lg:h-5 w-full pointer-events-none" />

              {/* Row 2: AKRAM Yellow Spotlight */}
              <div className="relative inline-flex items-center justify-center px-4 sm:px-6 md:px-8 max-w-full overflow-visible">
                <span className="hero-name-yellow-spotlight block text-[clamp(2.1rem,9.6vw,9.5rem)] tracking-[-0.025em] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 drop-shadow-[0_0_30px_rgba(250,204,21,0.9)] whitespace-nowrap overflow-visible">
                  {isNameAnimationComplete ? targetLast : displayedLast}
                </span>
              </div>
            </h1>
          </div>
        </div>

        {/* Layer 2 (Foreground - z-20): Centered Cutout Profile Portrait Overlapping the Name */}
        <div
          onClick={(e) => {
            if (canSelectInStudio) {
              e.stopPropagation();
              setSelectedElement({
                type: 'image',
                id: 'hero-avatar',
                label: 'Hero Avatar Portrait',
                breadcrumbs: [
                  { id: 'home', label: 'Home', type: 'section' },
                  { id: 'sec-hero', label: 'Hero', type: 'section' },
                  { id: 'hero-avatar', label: 'Avatar', type: 'image' }
                ]
              });
            }
          }}
          style={{
            ...avatarStyles,
            transform: `translateY(${avatarTranslateY}px)`,
            opacity: avatarOpacity,
            transition: avatarTransition,
            pointerEvents: isPortraitEntering ? 'auto' : 'none'
          }}
          className={`relative z-20 flex justify-center items-end h-full w-full max-w-[360px] sm:max-w-[460px] md:max-w-[540px] lg:max-w-[620px] xl:max-w-[680px] mx-auto select-none ${
            canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40 rounded-2xl' : ''
          } ${isAvatarSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] z-30 rounded-2xl' : ''}`}
        >
          {isAvatarSelected && canSelectInStudio && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-md">
              Hero Center Portrait
            </span>
          )}

          {/* Centered Cut-out Portrait Image with 3D Tilt Perspective - Sharp, Natural, Fully Opaque */}
          <div
            style={{
              transform: portraitTiltTransform,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
            className="relative w-full h-full flex items-end justify-center group"
          >
            <img
              src={portraitUrl}
              alt={`${data.personal.fullName} - Professional Profile`}
              className="hero-portrait-image w-auto max-h-[58vh] sm:max-h-[66vh] lg:max-h-[74vh] object-contain object-bottom select-none transition-transform duration-700 hover:scale-[1.01]"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('akram_hero_cutout_portrait.png')) {
                  target.src = resolveAssetUrl('/assets/images/akram_hero_cutout_portrait.png');
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Editorial Bar inside Hero: Rotating Focus, Short Bio & Action CTAs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-30 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 border-t border-white/[0.08] pt-5 sm:pt-6 bg-gradient-to-t from-[#090b10]/80 via-transparent to-transparent">
          {/* Left: Rotating Focus & Short Bio */}
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-300 mb-1.5">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold">FOCUS:</span>
              <span className="text-white font-heading tracking-tight transition-all duration-300 text-lg sm:text-xl font-bold">
                {data.personal.roles[roleIndex]}
              </span>
            </div>

            <p
              onClick={(e) => {
                if (canSelectInStudio) {
                  e.stopPropagation();
                  setSelectedElement({
                    type: 'hero',
                    id: 'hero-bio',
                    label: 'Hero Bio Summary',
                    breadcrumbs: [
                      { id: 'home', label: 'Home', type: 'section' },
                      { id: 'sec-hero', label: 'Hero', type: 'section' },
                      { id: 'hero-bio', label: 'Bio', type: 'hero' }
                    ]
                  });
                }
              }}
              style={bioStyles}
              className={`text-xs sm:text-sm text-slate-400 leading-relaxed ${
                canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40 rounded p-1' : ''
              } ${isBioSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10]' : ''}`}
            >
              {data.personal.shortBio}
            </p>
          </div>

          {/* Right: Curated Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 shrink-0">
            <a
              href={data.personal.primaryButtonLink || '#projects'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 shadow-lg shadow-amber-400/20 hover:shadow-amber-400/35 transition-all duration-300 cursor-pointer font-heading tracking-wide group"
            >
              <span>{data.personal.primaryButtonText || 'Explore Selected Works'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>

            <a
              href={data.personal.secondaryButtonLink || '#contact'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/30 transition-all duration-300 cursor-pointer font-heading tracking-wide group"
            >
              <span>{data.personal.secondaryButtonText || "Let's Connect"}</span>
              <ArrowDownRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
