import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SectionConfig, SectionType, CanvasElement } from '../../types/portfolio';
import { resolveElementStyles } from '../../utils/styleResolver';
import { Navbar } from '../layout/Navbar';
import { HeroSection } from '../sections/HeroSection';
import { AboutSection } from '../sections/AboutSection';
import { EducationSection } from '../sections/EducationSection';
import { SkillsSection } from '../sections/SkillsSection';
import { ServicesSection } from '../sections/ServicesSection';
import { ProjectsSection } from '../sections/ProjectsSection';
import { ExperienceSection } from '../sections/ExperienceSection';
import { ContactSection } from '../sections/ContactSection';
import { CustomSection } from '../sections/CustomSection';
import { Footer } from '../layout/Footer';
import {
  GripVertical,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  ChevronRight,
  Clipboard,
  Layers,
  ArrowUp,
  CornerDownRight,
  Check
} from 'lucide-react';

interface StudioCanvasProps {
  isPreviewMode: boolean;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({ isPreviewMode }) => {
  const {
    draftData,
    studioViewport,
    selectedElement,
    setSelectedElement,
    selectParentElement,
    moveSection,
    toggleSectionVisibility,
    duplicateSection,
    deleteSection,
    addSection,
    canvasZoom,
    copySelected,
    pasteClipboard,
    insertCanvasElement,
    updateElementStyle,
    copyElementStyle,
    pasteElementStyle,
    copiedStyle,
    deleteProject,
    duplicateProject,
    deleteSkill,
    duplicateSkill,
    deleteService,
    duplicateService,
    deleteExperience,
    duplicateExperience,
    deleteCanvasElement,
    moveCanvasElement
  } = usePortfolio();

  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [copiedStyleFeedback, setCopiedStyleFeedback] = useState(false);

  const viewportWidthClasses = {
    desktop: 'w-full max-w-[1440px]',
    tablet: 'w-[768px] max-w-full my-6 rounded-2xl border border-white/10 shadow-2xl overflow-hidden',
    mobile: 'w-[375px] max-w-full my-6 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden'
  };

  const sortedSections = [...draftData.sections].sort((a, b) => a.order - b.order);

  // Drag and Drop element insertion from Elements sidebar
  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverSectionId(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverSectionId(null);
  };

  const handleDropElement = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSectionId(null);
    const elementType = e.dataTransfer.getData('application/studio-element-type') as CanvasElement['type'];
    if (elementType) {
      insertCanvasElement(sectionId, elementType);
    }
  };

  const handleCopy = () => {
    copySelected();
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const renderSectionComponent = (sec: SectionConfig) => {
    switch (sec.type) {
      case 'hero':
        return <HeroSection />;
      case 'about':
        return <AboutSection />;
      case 'education':
        return <EducationSection />;
      case 'skills':
        return <SkillsSection />;
      case 'services':
        return <ServicesSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'contact':
        return <ContactSection />;
      case 'custom':
        return <CustomSection section={sec} />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => {
        if (!isPreviewMode) {
          // Clicking outer background clears selection
          // setSelectedElement(null);
        }
      }}
      className="flex-1 bg-[#06080c] overflow-y-auto flex flex-col items-center relative p-2 sm:p-4 selection:bg-sky-500/20"
    >
      {/* Floating Contextual Element Selection Toolbar */}
      {!isPreviewMode && selectedElement && (
        <div className="fixed top-18 z-40 flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 p-1.5 bg-[#090b10]/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl text-xs font-mono text-slate-300">
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1 px-2 text-[11px] text-slate-400 border-r border-white/10 mr-1">
              <button
                onClick={selectParentElement}
                className="hover:text-white flex items-center gap-1"
                title="Navigate to parent container (Escape)"
              >
                <span>Home</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </button>
              {selectedElement.breadcrumbs && selectedElement.breadcrumbs.length > 0 ? (
                selectedElement.breadcrumbs.map((b, i) => (
                  <span key={b.id} className="flex items-center gap-1">
                    <span className={i === selectedElement.breadcrumbs!.length - 1 ? 'text-sky-400 font-bold' : 'text-slate-300'}>
                      {b.label}
                    </span>
                    {i < selectedElement.breadcrumbs!.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    )}
                  </span>
                ))
              ) : (
                <span className="text-sky-400 font-bold">{selectedElement.label}</span>
              )}
            </div>

            {/* Style Copy & Paste */}
            <div className="flex items-center border-r border-white/10 pr-1 mr-1">
              <button
                onClick={() => {
                  copyElementStyle(selectedElement.id);
                  setCopiedStyleFeedback(true);
                  setTimeout(() => setCopiedStyleFeedback(false), 2000);
                }}
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                title="Copy Element Style"
              >
                {copiedStyleFeedback ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                )}
              </button>

              <button
                onClick={() => {
                  if (copiedStyle) {
                    pasteElementStyle(selectedElement.id);
                  }
                }}
                disabled={!copiedStyle}
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Paste Element Style"
              >
                <Clipboard className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>

            {/* Quick Actions (Data Copy / Paste) */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
              title="Copy Content (Ctrl+C)"
            >
              {copiedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => pasteClipboard(selectedElement.sectionId)}
              className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
              title="Paste Content (Ctrl+V)"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>

            {/* Alignment Quick Controls */}
            <div className="flex items-center border-l border-r border-white/10 px-1 mx-1">
              <button
                onClick={() => updateElementStyle(selectedElement.id, { typography: { textAlign: 'left' } })}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateElementStyle(selectedElement.id, { typography: { textAlign: 'center' } })}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateElementStyle(selectedElement.id, { typography: { textAlign: 'right' } })}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Section / Element Reordering & Duplication */}
            {selectedElement.type === 'section' && (
              <>
                <button
                  onClick={() => moveSection(selectedElement.id, 'up')}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                  title="Move Section Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveSection(selectedElement.id, 'down')}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                  title="Move Section Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => duplicateSection(selectedElement.id)}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                  title="Duplicate Section"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {selectedElement.type === 'project' && (
              <button
                onClick={() => duplicateProject(selectedElement.id)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                title="Duplicate Project"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedElement.type === 'skill' && (
              <button
                onClick={() => duplicateSkill(selectedElement.id)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                title="Duplicate Skill"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedElement.type === 'service' && (
              <button
                onClick={() => duplicateService(selectedElement.id)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                title="Duplicate Service"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedElement.type === 'experience' && (
              <button
                onClick={() => duplicateExperience(selectedElement.id)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                title="Duplicate Milestone"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Universal Delete Action */}
            <button
              onClick={() => {
                if (selectedElement.type === 'section') {
                  deleteSection(selectedElement.id);
                } else if (selectedElement.type === 'project') {
                  deleteProject(selectedElement.id);
                } else if (selectedElement.type === 'skill') {
                  deleteSkill(selectedElement.id);
                } else if (selectedElement.type === 'service') {
                  deleteService(selectedElement.id);
                } else if (selectedElement.type === 'experience') {
                  deleteExperience(selectedElement.id);
                } else if (selectedElement.type === 'element' && selectedElement.sectionId) {
                  deleteCanvasElement(selectedElement.sectionId, selectedElement.id);
                }
                setSelectedElement(null);
              }}
              className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
              title="Delete Selected Item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Viewport Frame Container with Canvas Zoom */}
      <div
        style={{
          transform: `scale(${canvasZoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`transition-all duration-300 bg-[#090b10] text-[#f0f4f8] min-h-screen relative flex flex-col shadow-2xl ${
          viewportWidthClasses[studioViewport]
        }`}
      >
        <Navbar />

        {/* Dynamic Sections Stack */}
        <main className="flex-1">
          {sortedSections.map((section, index) => {
            const isSelected = selectedElement?.id === section.id;
            const isVisible = section.isVisible;
            const isDropTarget = dragOverSectionId === section.id;
            const customStyles = resolveElementStyles(section.style, studioViewport);

            if (isPreviewMode && !isVisible) return null;

            return (
              <div
                key={section.id}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropElement(e, section.id)}
                onClick={(e) => {
                  if (isPreviewMode) return;
                  e.stopPropagation();
                  setSelectedElement({
                    type: 'section',
                    id: section.id,
                    label: section.title,
                    sublabel: section.internalId,
                    breadcrumbs: [
                      { id: 'page-home', label: 'Home', type: 'section' },
                      { id: section.id, label: section.title, type: 'section' }
                    ]
                  });
                }}
                className={`relative transition-all ${
                  !isPreviewMode ? 'group/canvas-sec' : ''
                } ${
                  isSelected && !isPreviewMode
                    ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] z-20'
                    : !isPreviewMode
                    ? 'hover:ring-1 hover:ring-sky-400/40'
                    : ''
                } ${!isVisible && !isPreviewMode ? 'opacity-40 bg-stripes' : ''}`}
                style={customStyles}
              >
                {/* Visual Drop Indicator Line */}
                {isDropTarget && (
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] z-50 animate-pulse" />
                )}

                {/* Section Action Handle in Studio Mode */}
                {!isPreviewMode && (
                  <div className="absolute top-2 right-4 z-30 opacity-0 group-hover/canvas-sec:opacity-100 transition-opacity flex items-center gap-1 p-1 bg-[#090b10]/95 border border-white/15 rounded-lg shadow-xl text-xs font-mono text-slate-300">
                    <span className="px-2 py-0.5 text-[10px] text-sky-400 font-bold">
                      {section.title}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(section.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-white/[0.06]"
                      title="Move Up"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(section.id, 'down');
                      }}
                      disabled={index === sortedSections.length - 1}
                      className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-white/[0.06]"
                      title="Move Down"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionVisibility(section.id);
                      }}
                      className="p-1 hover:text-white rounded hover:bg-white/[0.06]"
                      title={isVisible ? 'Hide Section' : 'Show Section'}
                    >
                      {isVisible ? (
                        <Eye className="w-3 h-3 text-slate-300" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-amber-400" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSection(section.id);
                      }}
                      className="p-1 hover:text-white rounded hover:bg-white/[0.06]"
                      title="Duplicate Section"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      disabled={sortedSections.length <= 1}
                      className="p-1 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-white/[0.06]"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSection('custom', 'New Custom Block');
                      }}
                      className="p-1 hover:text-emerald-400 rounded hover:bg-white/[0.06]"
                      title="Add Section Below"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Render the section */}
                {renderSectionComponent(section)}
              </div>
            );
          })}
        </main>

        <Footer />
      </div>
    </div>
  );
};
