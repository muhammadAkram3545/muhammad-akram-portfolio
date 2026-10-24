import React, { useEffect } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { OpeningExperience } from './components/intro/OpeningExperience';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { EducationSection } from './components/sections/EducationSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ContactSection } from './components/sections/ContactSection';
import { CustomSection } from './components/sections/CustomSection';
import { Footer } from './components/layout/Footer';
import { StudioLayout } from './components/studio/StudioLayout';
import { LivePreviewCustomizer } from './components/admin/LivePreviewCustomizer';
import { SectionConfig } from './types/portfolio';

const PortfolioContent: React.FC = () => {
  const {
    data,
    setActiveSection,
    isStudioRoute,
    setIsStudioRoute,
    auth,
    viewMode
  } = usePortfolio();

  // Scroll spy to update active section in navbar
  useEffect(() => {
    if (isStudioRoute) return;

    const sectionIds = ['home', 'about', 'education', 'skills', 'services', 'projects', 'experience', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection, isStudioRoute]);

  // Global hotkey: Cmd/Ctrl + Shift + A to open Studio Builder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsStudioRoute(!isStudioRoute);
        if (!isStudioRoute) {
          window.location.hash = '#studio';
        } else {
          window.location.hash = '';
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudioRoute, setIsStudioRoute]);

  // ROUTE BRANCH: If in Studio mode, render Visual Studio Builder
  if (isStudioRoute) {
    return <StudioLayout />;
  }

  // PUBLIC WEBSITE BRANCH: Render clean, production portfolio
  // Canonical order: Hero -> About -> Education -> Skills -> Services -> Projects -> Experience -> Contact -> Custom
  const getSectionCanonicalWeight = (sec: SectionConfig): number => {
    const typeKey = (sec.type || '').toLowerCase();
    const idKey = (sec.id || '').toLowerCase();
    if (typeKey === 'hero' || typeKey === 'home' || idKey === 'sec-hero') return 1;
    if (typeKey === 'about' || idKey === 'sec-about') return 2;
    if (typeKey === 'education' || idKey === 'sec-education') return 3;
    if (typeKey === 'skills' || idKey === 'sec-skills') return 4;
    if (typeKey === 'services' || idKey === 'sec-services') return 5;
    if (typeKey === 'projects' || idKey === 'sec-projects') return 6;
    if (typeKey === 'experience' || idKey === 'sec-experience') return 7;
    if (typeKey === 'contact' || idKey === 'sec-contact') return 8;
    return 100 + (sec.order || 0);
  };

  const visibleSections = [...data.sections]
    .filter((sec) => sec.isVisible)
    .sort((a, b) => getSectionCanonicalWeight(a) - getSectionCanonicalWeight(b));

  const renderSection = (sec: SectionConfig) => {
    switch (sec.type) {
      case 'hero':
        return <HeroSection key={sec.id} />;
      case 'about':
        return <AboutSection key={sec.id} />;
      case 'education':
        return <EducationSection key={sec.id} />;
      case 'skills':
        return <SkillsSection key={sec.id} />;
      case 'services':
        return <ServicesSection key={sec.id} />;
      case 'projects':
        return <ProjectsSection key={sec.id} />;
      case 'experience':
        return <ExperienceSection key={sec.id} />;
      case 'contact':
        return <ContactSection key={sec.id} />;
      case 'custom':
        return <CustomSection key={sec.id} section={sec} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-sky-500/20 selection:text-sky-300">
      {/* Opening Intro Animation Experience */}
      <OpeningExperience />

      {/* Main Top Navigation */}
      <Navbar />

      {/* Dynamic Content Sections */}
      <main>
        {visibleSections.map(renderSection)}
      </main>

      {/* Footer */}
      <Footer />

      {/* Studio Live Customizer: Only shown if explicitly authenticated in draft mode */}
      {auth.isAuthenticated && viewMode === 'draft' && (
        <LivePreviewCustomizer />
      )}
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}
