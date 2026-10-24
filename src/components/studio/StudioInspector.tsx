import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ElementStyleConfig, StudioViewport } from '../../types/portfolio';
import {
  X,
  Sliders,
  Sparkles,
  Type,
  Image as ImageIcon,
  Link,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Play,
  Check,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Settings2,
  FileText,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Clipboard,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  User
} from 'lucide-react';
import { TypographyControls } from './inspector/TypographyControls';
import { SpacingControls } from './inspector/SpacingControls';
import { LayoutSizeControls } from './inspector/LayoutSizeControls';
import { BackgroundControls } from './inspector/BackgroundControls';
import { BorderShadowControls } from './inspector/BorderShadowControls';
import { AnimationControls } from './inspector/AnimationControls';
import { MobileImageUploadField } from '../common/MobileImageUploadField';
import { PORTFOLIO_IMAGE_ACCEPT, uploadLocalFile } from '../../utils/fileUploadHelper';

export const StudioInspector: React.FC = () => {
  const {
    draftData,
    updateDraft,
    selectedElement,
    setSelectedElement,
    updateProject,
    deleteProject,
    updateSkill,
    deleteSkill,
    updateService,
    deleteService,
    updateExperience,
    deleteExperience,
    updateSectionConfig,
    deleteSection,
    moveSection,
    replayIntro,
    studioViewport,
    setStudioViewport,
    getElementStyle,
    updateElementStyle,
    resetElementStyle,
    resetResponsiveOverride,
    copyElementStyle,
    pasteElementStyle,
    copiedStyle,
    updateCanvasElement,
    openMediaPicker,
    addProjectGalleryImage,
    removeProjectGalleryImage
  } = usePortfolio();

  const [activeInspectorTab, setActiveInspectorTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [styleSectionOpen, setStyleSectionOpen] = useState({
    layout: true,
    spacing: true,
    typography: true,
    background: false,
    border: false
  });
  const [copiedStyleFeedback, setCopiedStyleFeedback] = useState(false);

  const toggleStyleSection = (key: keyof typeof styleSectionOpen) => {
    setStyleSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!selectedElement) {
    return (
      <aside className="w-80 bg-[#0c0f16] border-l border-white/[0.08] p-5 flex flex-col justify-between h-full z-20 shrink-0 select-none text-slate-300 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Inspector Context</span>
          </div>

          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#121620] text-center space-y-2">
            <p className="text-xs text-slate-300 font-medium">
              No Element Selected
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Click any section, headline, project card, skill item or button directly in the canvas to inspect, style, and customize it.
            </p>
          </div>

          {/* Quick Focus Shortcuts */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono text-sky-400 uppercase">
              Quick Focus Elements
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {[
                { type: 'hero', id: 'hero-headline', label: 'Hero Headline & Name' },
                { type: 'hero', id: 'hero-bio', label: 'Hero Bio Description' },
                { type: 'about', id: 'sec-about', label: 'About Narrative Section' },
                { type: 'contact', id: 'sec-contact', label: 'Availability & Contact' },
                { type: 'intro', id: 'intro-settings', label: 'Opening Animation' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setSelectedElement({
                      type: item.type as any,
                      id: item.id,
                      label: item.label,
                      breadcrumbs: [
                        { id: 'home', label: 'Home', type: 'section' },
                        { id: item.id, label: item.label, type: item.type as any }
                      ]
                    })
                  }
                  className="p-2 rounded-lg bg-[#121620] hover:bg-sky-500/10 hover:text-sky-300 text-left transition-colors text-slate-300"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06] text-[10px] text-slate-500 font-mono">
          Visual Studio Inspector v3.0 · Elementor/Webflow Grade
        </div>
      </aside>
    );
  }

  // Active entities
  const activeSectionConfig = draftData.sections.find((s) => s.id === selectedElement.id);
  const activeProject = draftData.projects.find((p) => p.id === selectedElement.id);
  const activeSkill = draftData.skills.find((s) => s.id === selectedElement.id);
  const activeService = draftData.services.find((s) => s.id === selectedElement.id);
  const activeExperience = draftData.experience.find((e) => e.id === selectedElement.id);

  // Active canvas element if any
  let activeCanvasElement = null;
  let activeCanvasElementSectionId = selectedElement.sectionId;
  for (const s of draftData.sections) {
    const found = s.elements?.find((el) => el.id === selectedElement.id);
    if (found) {
      activeCanvasElement = found;
      activeCanvasElementSectionId = s.id;
      break;
    }
  }

  // Active element style
  const currentElementStyle: ElementStyleConfig = getElementStyle(selectedElement.id) || {};
  const isEditingResponsive = studioViewport !== 'desktop';

  const handleCopyStyle = () => {
    copyElementStyle(selectedElement.id);
    setCopiedStyleFeedback(true);
    setTimeout(() => setCopiedStyleFeedback(false), 2000);
  };

  const handlePasteStyle = () => {
    pasteElementStyle(selectedElement.id);
  };

  return (
    <aside className="w-80 bg-[#0c0f16] border-l border-white/[0.08] flex flex-col h-full z-20 shrink-0 select-none text-slate-300 overflow-y-auto">
      {/* Inspector Top Bar with Breadcrumb and Deselect */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#090b10]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[9px] uppercase font-bold tracking-wider border border-sky-500/20">
              {selectedElement.type}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[170px]">
              {selectedElement.label}
            </span>
          </div>

          <button
            onClick={() => setSelectedElement(null)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.06] transition-colors"
            title="Deselect element"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breadcrumb Path */}
        {selectedElement.breadcrumbs && selectedElement.breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono overflow-x-auto whitespace-nowrap scrollbar-none">
            {selectedElement.breadcrumbs.map((b, i) => (
              <span key={b.id} className="flex items-center gap-1">
                <span className={i === selectedElement.breadcrumbs!.length - 1 ? 'text-sky-400 font-medium' : 'text-slate-400'}>
                  {b.label}
                </span>
                {i < selectedElement.breadcrumbs!.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3 Inspector Tabs: Content | Style | Advanced */}
      <div className="grid grid-cols-3 border-b border-white/[0.08] bg-[#080a0f] text-xs font-mono">
        <button
          onClick={() => setActiveInspectorTab('content')}
          className={`flex items-center justify-center gap-1.5 py-2.5 transition-colors cursor-pointer border-b-2 ${
            activeInspectorTab === 'content'
              ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/[0.05]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Content</span>
        </button>

        <button
          onClick={() => setActiveInspectorTab('style')}
          className={`flex items-center justify-center gap-1.5 py-2.5 transition-colors cursor-pointer border-b-2 ${
            activeInspectorTab === 'style'
              ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/[0.05]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>

        <button
          onClick={() => setActiveInspectorTab('advanced')}
          className={`flex items-center justify-center gap-1.5 py-2.5 transition-colors cursor-pointer border-b-2 ${
            activeInspectorTab === 'advanced'
              ? 'border-sky-400 text-sky-400 font-bold bg-sky-500/[0.05]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Advanced</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CONTENT TAB */}
      {/* ======================================================== */}
      {activeInspectorTab === 'content' && (
        <div className="p-4 space-y-5 flex-1">
          {/* SECTION CONTENT */}
          {selectedElement.type === 'section' && activeSectionConfig && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SECTION TITLE
                </label>
                <input
                  type="text"
                  value={activeSectionConfig.title}
                  onChange={(e) =>
                    updateSectionConfig(activeSectionConfig.id, { title: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  ANCHOR IDENTIFIER (#ID)
                </label>
                <input
                  type="text"
                  value={activeSectionConfig.internalId}
                  onChange={(e) =>
                    updateSectionConfig(activeSectionConfig.id, { internalId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono focus:border-sky-400 outline-none"
                />
              </div>

              {/* Custom section fields */}
              {activeSectionConfig.type === 'custom' && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      HEADING TEXT
                    </label>
                    <input
                      type="text"
                      value={activeSectionConfig.customTitle || ''}
                      onChange={(e) =>
                        updateSectionConfig(activeSectionConfig.id, { customTitle: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      CONTENT PROSE
                    </label>
                    <textarea
                      rows={4}
                      value={activeSectionConfig.customContent || ''}
                      onChange={(e) =>
                        updateSectionConfig(activeSectionConfig.id, { customContent: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121620] border border-white/[0.08]">
                <div>
                  <div className="font-semibold text-white">Section Visibility</div>
                  <div className="text-[10px] text-slate-500">Render on published portfolio</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeSectionConfig.isVisible}
                  onChange={(e) =>
                    updateSectionConfig(activeSectionConfig.id, { isVisible: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-400 rounded focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Section Actions */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => moveSection(activeSectionConfig.id, 'up')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                  <span>Move Up</span>
                </button>

                <button
                  onClick={() => moveSection(activeSectionConfig.id, 'down')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                  <span>Move Down</span>
                </button>

                <button
                  onClick={() => {
                    deleteSection(activeSectionConfig.id);
                    setSelectedElement(null);
                  }}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* HERO ELEMENT CONTENT */}
          {(selectedElement.type === 'hero' || selectedElement.id.startsWith('hero-')) && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={draftData.personal.fullName}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, fullName: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              {/* Rotating Roles Editor */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  ROTATING DISCIPLINES / ROLES
                </label>
                <div className="space-y-1.5 mb-2">
                  {draftData.personal.roles.map((r, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={r}
                        onChange={(e) => {
                          const updated = [...draftData.personal.roles];
                          updated[i] = e.target.value;
                          updateDraft((prev) => ({
                            ...prev,
                            personal: { ...prev.personal, roles: updated }
                          }));
                        }}
                        className="flex-1 px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          if (draftData.personal.roles.length > 1) {
                            const updated = draftData.personal.roles.filter((_, idx) => idx !== i);
                            updateDraft((prev) => ({
                              ...prev,
                              personal: { ...prev.personal, roles: updated }
                            }));
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remove role"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    updateDraft((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, roles: [...prev.personal.roles, 'New Specialization'] }
                    }));
                  }}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Role Discipline</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SHORT BIO SUMMARY
                </label>
                <textarea
                  rows={4}
                  value={draftData.personal.shortBio}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, shortBio: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  AVAILABILITY STATEMENT
                </label>
                <input
                  type="text"
                  value={draftData.personal.availabilityNote}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, availabilityNote: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <MobileImageUploadField
                  label="Avatar Portrait"
                  description="Choose from mobile gallery or paste path"
                  value={draftData.personal.avatarUrl || ''}
                  onChange={(url) =>
                    updateDraft((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, avatarUrl: url }
                    }))
                  }
                  onOpenVault={() =>
                    openMediaPicker((media) => {
                      updateDraft((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, avatarUrl: media.url }
                      }));
                    }, 'image')
                  }
                  aspectRatio="square"
                  previewHeightClass="h-16 w-16"
                />
              </div>
            </div>
          )}

          {/* PROJECT CONTENT */}
          {selectedElement.type === 'project' && activeProject && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  PROJECT TITLE
                </label>
                <input
                  type="text"
                  value={activeProject.title}
                  onChange={(e) =>
                    updateProject(activeProject.id, { title: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CATEGORY
                </label>
                <input
                  type="text"
                  value={activeProject.category}
                  onChange={(e) =>
                    updateProject(activeProject.id, { category: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SHORT DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={activeProject.shortDescription}
                  onChange={(e) =>
                    updateProject(activeProject.id, { shortDescription: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  TECHNOLOGIES (COMMA-SEPARATED)
                </label>
                <input
                  type="text"
                  value={activeProject.technologies.join(', ')}
                  onChange={(e) =>
                    updateProject(activeProject.id, {
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <MobileImageUploadField
                  label="Featured Project Image"
                  description="Choose from mobile gallery or paste URL"
                  value={activeProject.imageUrl || ''}
                  onChange={(url) => updateProject(activeProject.id, { imageUrl: url })}
                  onOpenVault={() =>
                    openMediaPicker((media) => {
                      updateProject(activeProject.id, { imageUrl: media.url });
                    }, 'image')
                  }
                  aspectRatio="video"
                  allowClear={false}
                />
              </div>

              {/* Project Gallery Images Manager */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-slate-400">
                    GALLERY IMAGES ({activeProject.galleryImages?.length || 0})
                  </label>
                  <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Gallery Pick</span>
                        <input
                          type="file"
                          multiple
                          accept={PORTFOLIO_IMAGE_ACCEPT}
                          onClick={(e) => {
                            (e.target as HTMLInputElement).value = '';
                          }}
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const files = Array.from(e.target.files);
                              for (const file of files) {
                                try {
                                  const result = await uploadLocalFile(file, {
                                    name: `${activeProject.title} gallery`,
                                    altText: file.name
                                  });
                                  addProjectGalleryImage(activeProject.id, result.url);
                                } catch (err) {
                                  console.error('Gallery image upload failed:', err);
                                }
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaPicker((media) => {
                            addProjectGalleryImage(activeProject.id, media.url);
                          }, 'image')
                        }
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-300 font-medium"
                      >
                        <Plus className="w-3 h-3" />
                        <span>From Vault</span>
                      </button>
                    </div>
                  </div>

                {activeProject.galleryImages && activeProject.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {activeProject.galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-[#090b10] group flex items-center justify-center"
                      >
                        {img && img.trim() ? (
                          <img src={img.trim()} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-600" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeProjectGalleryImage(activeProject.id, idx)}
                          className="absolute top-1 right-1 p-1 rounded bg-black/70 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove from gallery"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No secondary gallery images.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    LIVE URL
                  </label>
                  <input
                    type="text"
                    value={activeProject.liveUrl || ''}
                    placeholder="https://..."
                    onChange={(e) =>
                      updateProject(activeProject.id, { liveUrl: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono text-[11px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    GITHUB URL
                  </label>
                  <input
                    type="text"
                    value={activeProject.githubUrl || ''}
                    placeholder="https://github.com/..."
                    onChange={(e) =>
                      updateProject(activeProject.id, { githubUrl: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono text-[11px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  METRICS OR HIGHLIGHT TAG
                </label>
                <input
                  type="text"
                  value={activeProject.metricsOrHighlight || ''}
                  placeholder="e.g. 99.9% Uptime or Production Live"
                  onChange={(e) =>
                    updateProject(activeProject.id, { metricsOrHighlight: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    deleteProject(activeProject.id);
                    setSelectedElement(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          )}

          {/* SKILL CONTENT */}
          {selectedElement.type === 'skill' && activeSkill && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SKILL NAME
                </label>
                <input
                  type="text"
                  value={activeSkill.name}
                  onChange={(e) =>
                    updateSkill(activeSkill.id, { name: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CATEGORY
                </label>
                <select
                  value={activeSkill.category}
                  onChange={(e) =>
                    updateSkill(activeSkill.id, { category: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="CMS & Platforms">CMS & Platforms</option>
                  <option value="UI/UX & Design">UI/UX & Design</option>
                  <option value="Media & Motion">Media & Motion</option>
                  <option value="AI & SEO">AI & SEO</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    PROFICIENCY PERCENTAGE
                  </label>
                  <span className="font-mono text-sky-400 font-bold">
                    {activeSkill.proficiencyPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={activeSkill.proficiencyPercentage}
                  onChange={(e) =>
                    updateSkill(activeSkill.id, {
                      proficiencyPercentage: parseInt(e.target.value, 10)
                    })
                  }
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  DESCRIPTION & CONTEXT
                </label>
                <textarea
                  rows={2}
                  value={activeSkill.description}
                  onChange={(e) =>
                    updateSkill(activeSkill.id, { description: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  BADGE TEXT
                </label>
                <input
                  type="text"
                  value={activeSkill.badgeText || ''}
                  onChange={(e) =>
                    updateSkill(activeSkill.id, { badgeText: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    deleteSkill(activeSkill.id);
                    setSelectedElement(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Skill</span>
                </button>
              </div>
            </div>
          )}

          {/* SERVICE CONTENT */}
          {selectedElement.type === 'service' && activeService && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SERVICE TITLE
                </label>
                <input
                  type="text"
                  value={activeService.title}
                  onChange={(e) =>
                    updateService(activeService.id, { title: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  EDITORIAL NUMBER
                </label>
                <input
                  type="text"
                  value={activeService.editorialNumber}
                  onChange={(e) =>
                    updateService(activeService.id, { editorialNumber: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  SERVICE DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={activeService.description}
                  onChange={(e) =>
                    updateService(activeService.id, { description: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CTA LABEL
                </label>
                <input
                  type="text"
                  value={activeService.ctaLabel}
                  onChange={(e) =>
                    updateService(activeService.id, { ctaLabel: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    deleteService(activeService.id);
                    setSelectedElement(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Service</span>
                </button>
              </div>
            </div>
          )}

          {/* EXPERIENCE CONTENT */}
          {selectedElement.type === 'experience' && activeExperience && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  ROLE & TITLE
                </label>
                <input
                  type="text"
                  value={activeExperience.role}
                  onChange={(e) =>
                    updateExperience(activeExperience.id, { role: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  COMPANY / CONTEXT
                </label>
                <input
                  type="text"
                  value={activeExperience.type}
                  onChange={(e) =>
                    updateExperience(activeExperience.id, { type: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  PERIOD
                </label>
                <input
                  type="text"
                  value={activeExperience.period}
                  onChange={(e) =>
                    updateExperience(activeExperience.id, { period: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={activeExperience.description}
                  onChange={(e) =>
                    updateExperience(activeExperience.id, { description: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none"
                />
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    deleteExperience(activeExperience.id);
                    setSelectedElement(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Milestone</span>
                </button>
              </div>
            </div>
          )}

          {/* CONTACT CONTENT */}
          {selectedElement.type === 'contact' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CONTACT TITLE
                </label>
                <input
                  type="text"
                  value={draftData.contact.sectionTitle}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, sectionTitle: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  DIRECT INQUIRY EMAIL
                </label>
                <input
                  type="email"
                  value={draftData.personal.email}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, email: e.target.value },
                      contact: { ...prev.contact, email: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  RESPONSE TIME STATEMENT
                </label>
                <input
                  type="text"
                  value={draftData.contact.responseTime}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, responseTime: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  WHATSAPP DIRECT LINK
                </label>
                <input
                  type="text"
                  value={draftData.contact.whatsappUrl}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, whatsappUrl: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono text-[11px] focus:border-sky-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* INTRO SETTINGS CONTENT */}
          {selectedElement.type === 'intro' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-2">
                  DISPLAY MODE
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'first_visit', label: 'First Visit Only (Default)' },
                    { id: 'always', label: 'Always Show On Load' },
                    { id: 'on_request', label: 'On Request Only' },
                    { id: 'disabled', label: 'Disabled Completely' }
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${
                        draftData.intro.mode === opt.id
                          ? 'bg-sky-500/10 border-sky-400 text-white'
                          : 'bg-[#121620] border-white/[0.08] text-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <input
                        type="radio"
                        name="intro-inspector-mode"
                        checked={draftData.intro.mode === opt.id}
                        onChange={() =>
                          updateDraft((prev) => ({
                            ...prev,
                            intro: { ...prev.intro, mode: opt.id as any }
                          }))
                        }
                        className="text-sky-400 focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  BRAND MONOGRAM
                </label>
                <input
                  type="text"
                  value={draftData.intro.brandMonogram}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      intro: { ...prev.intro, brandMonogram: e.target.value }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <button
                  onClick={replayIntro}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Trigger Live Intro Test</span>
                </button>
              </div>
            </div>
          )}

          {/* CANVAS ELEMENT CONTENT */}
          {activeCanvasElement && activeCanvasElementSectionId && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  TEXT CONTENT
                </label>
                <textarea
                  rows={3}
                  value={activeCanvasElement.content.text || ''}
                  onChange={(e) =>
                    updateCanvasElement(activeCanvasElementSectionId!, activeCanvasElement.id, {
                      content: { ...activeCanvasElement.content, text: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 focus:border-sky-400 outline-none resize-none leading-relaxed"
                />
              </div>

              {activeCanvasElement.type === 'button' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    TARGET LINK (HREF)
                  </label>
                  <input
                    type="text"
                    value={activeCanvasElement.content.url || ''}
                    placeholder="#contact or https://..."
                    onChange={(e) =>
                      updateCanvasElement(activeCanvasElementSectionId!, activeCanvasElement.id, {
                        content: { ...activeCanvasElement.content, url: e.target.value }
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 font-mono text-[11px] outline-none"
                  />
                </div>
              )}

              {activeCanvasElement.type === 'image' && (
                <div>
                  <MobileImageUploadField
                    label="Image Source"
                    description="Select image from mobile gallery, camera roll, or vault"
                    value={activeCanvasElement.content.imageUrl || ''}
                    onChange={(url) =>
                      updateCanvasElement(activeCanvasElementSectionId!, activeCanvasElement.id, {
                        content: {
                          ...activeCanvasElement.content,
                          imageUrl: url
                        }
                      })
                    }
                    onOpenVault={() =>
                      openMediaPicker((media) => {
                        updateCanvasElement(activeCanvasElementSectionId!, activeCanvasElement.id, {
                          content: {
                            ...activeCanvasElement.content,
                            imageUrl: media.url,
                            altText: media.altText || media.name
                          }
                        });
                      }, 'image')
                    }
                    aspectRatio="video"
                    allowClear={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STYLE TAB (Visual Builder Controls) */}
      {/* ======================================================== */}
      {activeInspectorTab === 'style' && (
        <div className="p-4 space-y-4 flex-1">
          {/* Responsive Viewport Override Indicator */}
          <div className="p-2.5 rounded-xl bg-[#090b10] border border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Styling Scope:
            </span>
            <div className="flex items-center gap-1 bg-[#121620] p-0.5 rounded-lg border border-white/10 text-xs font-mono">
              {(['desktop', 'tablet', 'mobile'] as StudioViewport[]).map((vp) => {
                const Icon = vp === 'desktop' ? Monitor : vp === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={vp}
                    onClick={() => setStudioViewport(vp)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] capitalize transition-colors ${
                      studioViewport === vp
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{vp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isEditingResponsive && (
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-400/30 text-[11px] text-sky-300 flex items-center justify-between">
              <span>Editing {studioViewport} responsive overrides</span>
              <button
                onClick={() => resetResponsiveOverride(selectedElement.id, studioViewport as any)}
                className="text-[10px] underline hover:text-white font-mono"
              >
                Clear Override
              </button>
            </div>
          )}

          {/* Collapsible Style Section 1: Layout & Sizing */}
          <div className="border border-white/10 rounded-xl bg-[#0e121a] overflow-hidden">
            <button
              onClick={() => toggleStyleSection('layout')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Layout & Dimensions</span>
              </span>
              {styleSectionOpen.layout ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {styleSectionOpen.layout && (
              <div className="p-3 pt-0 border-t border-white/[0.06]">
                <LayoutSizeControls
                  layout={currentElementStyle.layout}
                  size={currentElementStyle.size}
                  onLayoutChange={(newLayout) =>
                    updateElementStyle(selectedElement.id, { layout: newLayout }, isEditingResponsive)
                  }
                  onSizeChange={(newSize) =>
                    updateElementStyle(selectedElement.id, { size: newSize }, isEditingResponsive)
                  }
                />
              </div>
            )}
          </div>

          {/* Collapsible Style Section 2: Spacing (Margin & Padding) */}
          <div className="border border-white/10 rounded-xl bg-[#0e121a] overflow-hidden">
            <button
              onClick={() => toggleStyleSection('spacing')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Spacing (Margin & Padding)</span>
              </span>
              {styleSectionOpen.spacing ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {styleSectionOpen.spacing && (
              <div className="p-3 pt-0 border-t border-white/[0.06] space-y-4">
                <SpacingControls
                  label="Margin"
                  value={currentElementStyle.margin}
                  onChange={(newMargin) =>
                    updateElementStyle(selectedElement.id, { margin: newMargin }, isEditingResponsive)
                  }
                  onReset={() =>
                    updateElementStyle(
                      selectedElement.id,
                      { margin: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', isLinked: true } },
                      isEditingResponsive
                    )
                  }
                />
                <div className="border-t border-white/[0.06] pt-3">
                  <SpacingControls
                    label="Padding"
                    value={currentElementStyle.padding}
                    onChange={(newPadding) =>
                      updateElementStyle(selectedElement.id, { padding: newPadding }, isEditingResponsive)
                    }
                    onReset={() =>
                      updateElementStyle(
                        selectedElement.id,
                        { padding: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', isLinked: true } },
                        isEditingResponsive
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Style Section 3: Typography */}
          <div className="border border-white/10 rounded-xl bg-[#0e121a] overflow-hidden">
            <button
              onClick={() => toggleStyleSection('typography')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-sky-400" />
                <span>Typography</span>
              </span>
              {styleSectionOpen.typography ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {styleSectionOpen.typography && (
              <div className="p-3 pt-0 border-t border-white/[0.06]">
                <TypographyControls
                  value={currentElementStyle.typography}
                  onChange={(newTypo) =>
                    updateElementStyle(selectedElement.id, { typography: newTypo }, isEditingResponsive)
                  }
                  onReset={() =>
                    updateElementStyle(selectedElement.id, { typography: undefined }, isEditingResponsive)
                  }
                />
              </div>
            )}
          </div>

          {/* Collapsible Style Section 4: Background */}
          <div className="border border-white/10 rounded-xl bg-[#0e121a] overflow-hidden">
            <button
              onClick={() => toggleStyleSection('background')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Background & Colors</span>
              </span>
              {styleSectionOpen.background ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {styleSectionOpen.background && (
              <div className="p-3 pt-0 border-t border-white/[0.06]">
                <BackgroundControls
                  value={currentElementStyle.background}
                  onChange={(newBg) =>
                    updateElementStyle(selectedElement.id, { background: newBg }, isEditingResponsive)
                  }
                  onReset={() =>
                    updateElementStyle(selectedElement.id, { background: undefined }, isEditingResponsive)
                  }
                />
              </div>
            )}
          </div>

          {/* Collapsible Style Section 5: Border & Shadow */}
          <div className="border border-white/10 rounded-xl bg-[#0e121a] overflow-hidden">
            <button
              onClick={() => toggleStyleSection('border')}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Border & Shadow</span>
              </span>
              {styleSectionOpen.border ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {styleSectionOpen.border && (
              <div className="p-3 pt-0 border-t border-white/[0.06]">
                <BorderShadowControls
                  border={currentElementStyle.border}
                  shadow={currentElementStyle.shadow}
                  opacity={currentElementStyle.opacity}
                  onBorderChange={(newBorder) =>
                    updateElementStyle(selectedElement.id, { border: newBorder }, isEditingResponsive)
                  }
                  onShadowChange={(newShadow) =>
                    updateElementStyle(selectedElement.id, { shadow: newShadow }, isEditingResponsive)
                  }
                  onOpacityChange={(newOpacity) =>
                    updateElementStyle(selectedElement.id, { opacity: newOpacity }, isEditingResponsive)
                  }
                  onReset={() =>
                    updateElementStyle(
                      selectedElement.id,
                      { border: undefined, shadow: undefined, opacity: 1 },
                      isEditingResponsive
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ADVANCED TAB (Position, Animation, Hover, Attributes) */}
      {/* ======================================================== */}
      {activeInspectorTab === 'advanced' && (
        <div className="p-4 space-y-5 flex-1">
          {/* Position Controls */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              Position
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">POSITION TYPE</label>
              <select
                value={currentElementStyle.position?.position || 'static'}
                onChange={(e) =>
                  updateElementStyle(
                    selectedElement.id,
                    {
                      position: {
                        ...currentElementStyle.position,
                        position: e.target.value as any
                      }
                    },
                    isEditingResponsive
                  )
                }
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white outline-none font-mono"
              >
                <option value="static">Static (Default)</option>
                <option value="relative">Relative</option>
                <option value="absolute">Absolute</option>
                <option value="sticky">Sticky</option>
              </select>
            </div>

            {currentElementStyle.position?.position && currentElementStyle.position?.position !== 'static' && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">TOP</label>
                  <input
                    type="text"
                    placeholder="0px"
                    value={currentElementStyle.position?.top || ''}
                    onChange={(e) =>
                      updateElementStyle(
                        selectedElement.id,
                        {
                          position: {
                            ...currentElementStyle.position,
                            top: e.target.value
                          }
                        },
                        isEditingResponsive
                      )
                    }
                    className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1">Z-INDEX</label>
                  <input
                    type="number"
                    value={currentElementStyle.position?.zIndex ?? 1}
                    onChange={(e) =>
                      updateElementStyle(
                        selectedElement.id,
                        {
                          position: {
                            ...currentElementStyle.position,
                            zIndex: parseInt(e.target.value, 10) || 1
                          }
                        },
                        isEditingResponsive
                      )
                    }
                    className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Responsive Visibility Controls */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              Responsive Visibility
            </div>
            <div className="space-y-1.5 text-xs">
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
                const isVis = currentElementStyle.visibility ? currentElementStyle.visibility[device] !== false : true;
                return (
                  <label
                    key={device}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#090b10] border border-white/10 cursor-pointer"
                  >
                    <span className="capitalize text-slate-300">Show on {device}</span>
                    <input
                      type="checkbox"
                      checked={isVis}
                      onChange={(e) =>
                        updateElementStyle(
                          selectedElement.id,
                          {
                            visibility: {
                              desktop: currentElementStyle.visibility?.desktop ?? true,
                              tablet: currentElementStyle.visibility?.tablet ?? true,
                              mobile: currentElementStyle.visibility?.mobile ?? true,
                              [device]: e.target.checked
                            }
                          }
                        )
                      }
                      className="w-4 h-4 text-sky-400 rounded focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Motion, Transform & Hover Controls */}
          <div className="pt-3 border-t border-white/[0.08]">
            <AnimationControls
              animation={currentElementStyle.animation}
              transform={currentElementStyle.transform}
              hover={currentElementStyle.hover}
              onAnimationChange={(anim) =>
                updateElementStyle(selectedElement.id, { animation: anim })
              }
              onTransformChange={(tr) =>
                updateElementStyle(selectedElement.id, { transform: tr })
              }
              onHoverChange={(hov) =>
                updateElementStyle(selectedElement.id, { hover: hov })
              }
            />
          </div>

          {/* Custom CSS Class & Custom ID */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              Attributes
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">CSS CLASS</label>
              <input
                type="text"
                placeholder="e.g. custom-glow-card"
                value={currentElementStyle.customClass || ''}
                onChange={(e) =>
                  updateElementStyle(selectedElement.id, { customClass: e.target.value })
                }
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">CSS ID</label>
              <input
                type="text"
                placeholder="e.g. special-cta-btn"
                value={currentElementStyle.customId || ''}
                onChange={(e) =>
                  updateElementStyle(selectedElement.id, { customId: e.target.value })
                }
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Style Clipboard & Reset Actions */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <div className="text-[11px] font-mono text-sky-400 uppercase">
              Style Actions
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleCopyStyle}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#121620] hover:bg-sky-500/10 hover:text-sky-300 border border-white/10 transition-colors"
                title="Copy all styles of this element"
              >
                {copiedStyleFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Style</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePasteStyle}
                disabled={!copiedStyle}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#121620] hover:bg-sky-500/10 hover:text-sky-300 border border-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Paste copied styles onto this element"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste Style</span>
              </button>
            </div>

            <button
              onClick={() => resetElementStyle(selectedElement.id)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Element Styles</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
