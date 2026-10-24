import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { DashboardTab } from '../../types/dashboard';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { DashboardHome } from './DashboardHome';
import { StudioAuthModal } from './StudioAuthModal';
import { PublishModal } from './PublishModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { MediaManagerModal } from './inspector/MediaManagerModal';
import { StudioCanvas } from './StudioCanvas';
import { StudioSidebar } from './StudioSidebar';
import { StudioInspector } from './StudioInspector';

// Section Editors
import { HomeSectionEditor } from './sections/HomeSectionEditor';
import { AboutSectionEditor } from './sections/AboutSectionEditor';
import { SkillsSectionEditor } from './sections/SkillsSectionEditor';
import { ServicesSectionEditor } from './sections/ServicesSectionEditor';
import { ProjectsSectionEditor } from './sections/ProjectsSectionEditor';
import { ExperienceSectionEditor } from './sections/ExperienceSectionEditor';
import { ContactSectionEditor } from './sections/ContactSectionEditor';
import { SocialsSectionEditor } from './sections/SocialsSectionEditor';
import { NavigationSectionEditor } from './sections/NavigationSectionEditor';
import { FooterSectionEditor } from './sections/FooterSectionEditor';
import { SettingsSectionEditor } from './sections/SettingsSectionEditor';
import { MediaLibrarySection } from './sections/MediaLibrarySection';

export const StudioLayout: React.FC = () => {
  const {
    auth,
    undo,
    redo,
    saveDraftManual,
    setSelectedElement,
    isMediaPickerOpen,
    closeMediaPicker,
    confirmMediaPickerSelect,
    mediaPickerFilter,
    openMediaPicker
  } = usePortfolio();

  // Active section tab in the non-technical dashboard
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCanvasMode, setIsCanvasMode] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z -> Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z -> Redo
      if (
        ((e.metaKey || e.ctrlKey) && e.key === 'y') ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S -> Save draft
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDraftManual();
      }
      // Escape -> Deselect / Close preview
      if (e.key === 'Escape') {
        setSelectedElement(null);
        if (isPreviewMode) setIsPreviewMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveDraftManual, isPreviewMode, setSelectedElement]);

  // If not authenticated, require unlock modal
  if (!auth.isAuthenticated) {
    return <StudioAuthModal />;
  }

  // Render current active workspace section
  const renderWorkspaceContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome
            onNavigateToSection={(tab) => setActiveTab(tab)}
            onOpenPublish={() => setIsPublishModalOpen(true)}
            onOpenVersions={() => setIsVersionsModalOpen(true)}
            onOpenPreview={() => setIsPreviewMode(true)}
          />
        );
      case 'home':
        return <HomeSectionEditor />;
      case 'about':
        return <AboutSectionEditor />;
      case 'skills':
        return <SkillsSectionEditor />;
      case 'services':
        return <ServicesSectionEditor />;
      case 'projects':
        return <ProjectsSectionEditor />;
      case 'experience':
        return <ExperienceSectionEditor />;
      case 'contact':
        return <ContactSectionEditor />;
      case 'socials':
        return <SocialsSectionEditor />;
      case 'media':
        return <MediaLibrarySection />;
      case 'navigation':
        return <NavigationSectionEditor />;
      case 'footer':
        return <FooterSectionEditor />;
      case 'settings':
        return <SettingsSectionEditor />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#06080c] text-[#f0f4f8] select-none">
      {/* Top Bar Navigation */}
      <DashboardTopBar
        activeTab={activeTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenVersions={() => setIsVersionsModalOpen(true)}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        isPreviewMode={isPreviewMode}
        isCanvasMode={isCanvasMode}
        onToggleCanvasMode={() => setIsCanvasMode(!isCanvasMode)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Hidden in full Preview mode) */}
        {!isPreviewMode && (
          <DashboardSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Center Editing Area: Preview, Visual Canvas, or Clean Form Cards */}
        {isPreviewMode ? (
          <div className="flex-1 overflow-hidden relative">
            <StudioCanvas isPreviewMode={true} />
          </div>
        ) : isCanvasMode ? (
          // Visual Canvas Mode (Elementor/Webflow style)
          <div className="flex-1 flex overflow-hidden relative">
            <StudioSidebar />
            <StudioCanvas isPreviewMode={false} />
            <StudioInspector />
          </div>
        ) : (
          // Clean Professional Non-Technical CMS Editor Mode
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#06080c]/90">
            {renderWorkspaceContent()}
          </main>
        )}
      </div>

      {/* Modals & Dialogs */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      <VersionHistoryModal
        isOpen={isVersionsModalOpen}
        onClose={() => setIsVersionsModalOpen(false)}
      />

      <MediaManagerModal
        isOpen={isMediaPickerOpen}
        onClose={closeMediaPicker}
        onSelect={confirmMediaPickerSelect}
        filterType={mediaPickerFilter}
      />
    </div>
  );
};
