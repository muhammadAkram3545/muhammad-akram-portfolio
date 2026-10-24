import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioData } from '../../types/portfolio';
import { Menu, X, SlidersHorizontal, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    data,
    currentThemePreset,
    toggleTheme,
    isCustomizerOpen,
    setIsCustomizerOpen,
    activeSection,
    auth,
    setIsStudioRoute
  } = usePortfolio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll for subtle elevation styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleNavItems = data.navigation
    .filter((item) => item.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#090b10]/85 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-sm'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single text element Brand Zone */}
          <a
            href="#home"
            className="text-lg font-bold tracking-tight text-white hover:text-amber-300 transition-colors flex items-center gap-2 group"
          >
            <span className="font-heading tracking-normal">{data.personal.fullName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-90 group-hover:scale-125 transition-transform" />
          </a>

          {/* Zone 2: Clean text navigation links with subtle underline */}
          <nav className="hidden md:flex items-center gap-7">
            {visibleNavItems.map((item) => {
              const targetId = item.href.replace('#', '');
              const isActive = activeSection === targetId;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {currentThemePreset === 'minimal-light' ? (
                <Moon className="w-4 h-4 text-amber-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Studio entry / Visual Builder */}
            <button
              onClick={() => {
                setIsStudioRoute(true);
                window.location.hash = '#studio';
              }}
              aria-label="Open Studio Builder"
              className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer relative"
              title="Open Studio Visual Builder & Media Manager"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {auth.isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Primary Action Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold tracking-wide text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-all whitespace-nowrap shadow-sm shadow-amber-400/20"
            >
              Let's Talk
            </a>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0d14] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-2 mt-2">
          {visibleNavItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
            >
              Let's Talk
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
