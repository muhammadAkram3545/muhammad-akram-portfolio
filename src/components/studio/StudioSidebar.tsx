import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  StudioSidebarTab,
  ContentManagerSubtab,
  SectionType,
  SelectedElement
} from '../../types/portfolio';
import {
  Layers,
  Component,
  FolderTree,
  Sliders,
  Image as ImageIcon,
  Palette,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  ArrowRight,
  Briefcase,
  Code,
  FileCode,
  Sparkles,
  ShoppingBag,
  Film,
  Compass,
  MessageSquare,
  Play,
  Upload,
  Check,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { PORTFOLIO_IMAGE_ACCEPT, uploadLocalFile } from '../../utils/fileUploadHelper';

export const StudioSidebar: React.FC = () => {
  const {
    draftData,
    updateDraft,
    selectedElement,
    setSelectedElement,
    reorderSections,
    moveSection,
    toggleSectionVisibility,
    duplicateSection,
    deleteSection,
    addSection,
    addProject,
    deleteProject,
    duplicateProject,
    addSkill,
    deleteSkill,
    duplicateSkill,
    addService,
    deleteService,
    duplicateService,
    addExperience,
    deleteExperience,
    duplicateExperience,
    addNavItem,
    deleteNavItem,
    addMediaItem,
    deleteMediaItem,
    openMediaPicker,
    getMediaUsage,
    replayIntro
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<StudioSidebarTab>('sections');
  const [managerSubtab, setManagerSubtab] = useState<ContentManagerSubtab>('projects');
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [addSectionMenuOpen, setAddSectionMenuOpen] = useState(false);
  const [mediaUploadSuccess, setMediaUploadSuccess] = useState(false);

  // Section Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSectionIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSectionIndex !== null && draggedSectionIndex !== targetIndex) {
      reorderSections(draggedSectionIndex, targetIndex);
    }
    setDraggedSectionIndex(null);
  };

  // Real & Resilient Media Upload from Mobile Gallery / File Picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadLocalFile(file, {
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        altText: file.name.replace(/\.[^/.]+$/, '')
      });

      if (result.mediaItem) {
        addMediaItem(result.mediaItem);
      } else {
        addMediaItem({
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          filename: file.name,
          originalFilename: file.name,
          url: result.url,
          alt: file.name,
          altText: file.name,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          dimensions: 'Custom Upload',
          usedIn: ['Custom Media'],
          source: 'upload'
        });
      }

      setMediaUploadSuccess(true);
      setTimeout(() => setMediaUploadSuccess(false), 2500);
    } catch (err) {
      console.error('[StudioSidebar] Upload failed:', err);
    }
  };

  const sortedSections = [...draftData.sections].sort((a, b) => a.order - b.order);

  return (
    <aside className="w-80 bg-[#0c0f16] border-r border-white/[0.08] flex flex-col h-full z-20 shrink-0 select-none text-slate-300">
      {/* Primary Tab Navigation Icons */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090b10] px-2 py-1.5 text-xs font-mono">
        {[
          { id: 'sections', label: 'Sections', icon: Layers },
          { id: 'elements', label: 'Elements', icon: Component },
          { id: 'navigator', label: 'Layers', icon: FolderTree },
          { id: 'managers', label: 'Content', icon: Sliders },
          { id: 'media', label: 'Media', icon: ImageIcon },
          { id: 'styles', label: 'Styles', icon: Palette }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioSidebarTab)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ======================================================== */}
        {/* TAB 1: SECTIONS */}
        {/* ======================================================== */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                  PORTFOLIO SECTIONS
                </h3>
                <p className="text-[11px] text-slate-400">
                  Drag to reorder or click to edit
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={() => setAddSectionMenuOpen(!addSectionMenuOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>

                {/* Add Section Flyout Menu */}
                {addSectionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0f131a] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                    <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase">
                      Choose Section Type
                    </div>
                    {[
                      { type: 'hero', label: 'Hero / Home' },
                      { type: 'about', label: 'About Section' },
                      { type: 'education', label: 'Education Section' },
                      { type: 'skills', label: 'Skills Section' },
                      { type: 'services', label: 'Services Section' },
                      { type: 'projects', label: 'Projects Showcase' },
                      { type: 'experience', label: 'Experience Timeline' },
                      { type: 'contact', label: 'Contact Block' },
                      { type: 'custom', label: 'Custom Content Section' }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => {
                          addSection(item.type as SectionType);
                          setAddSectionMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-500/10 hover:text-sky-300 text-slate-300 transition-colors flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <Plus className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Draggable Section Items */}
            <div className="space-y-2">
              {sortedSections.map((section, index) => {
                const isSelected = selectedElement?.id === section.id;
                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={() =>
                      setSelectedElement({
                        type: 'section',
                        id: section.id,
                        label: section.title,
                        sublabel: section.internalId
                      })
                    }
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-400 text-white shadow-sm'
                        : 'bg-[#121620] border-white/[0.08] hover:border-white/[0.18] text-slate-300'
                    } ${!section.isVisible ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="cursor-grab active:cursor-grabbing text-slate-500 group-hover:text-slate-300">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate text-white">
                          {section.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          #{section.internalId}
                        </div>
                      </div>
                    </div>

                    {/* Quick Section Controls */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.06]"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={index === sortedSections.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.06]"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06]"
                        title={section.isVisible ? 'Hide Section' : 'Show Section'}
                      >
                        {section.isVisible ? (
                          <Eye className="w-3.5 h-3.5 text-slate-300" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>

                      <button
                        onClick={() => duplicateSection(section.id)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06]"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteSection(section.id)}
                        disabled={sortedSections.length <= 1}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 disabled:opacity-20 hover:bg-white/[0.06]"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ELEMENT LIBRARY */}
        {/* ======================================================== */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                ELEMENT LIBRARY
              </h3>
              <p className="text-[11px] text-slate-400">
                Click or drag elements to customize layout blocks
              </p>
            </div>

            {/* Basic Elements */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-sky-400 uppercase">
                Basic Elements
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Heading', icon: 'H1' },
                  { name: 'Paragraph', icon: 'P' },
                  { name: 'Button CTA', icon: 'CTA' },
                  { name: 'Image Box', icon: 'IMG' },
                  { name: 'Icon Affordance', icon: 'ICO' },
                  { name: 'Hairline Divider', icon: 'DIV' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      addSection('custom', `Custom ${item.name} Block`);
                    }}
                    className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400 hover:bg-sky-500/10 text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-mono text-[10px] text-sky-400 mb-1">{item.icon}</div>
                    <div className="font-medium text-slate-200 group-hover:text-white text-[11px]">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Specific Blocks */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="text-[11px] font-mono text-sky-400 uppercase">
                Portfolio Blocks
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Skill Meter', action: () => addSkill() },
                  { name: 'Service Card', action: () => addService() },
                  { name: 'Project Tile', action: () => addProject() },
                  { name: 'Career Milestone', action: () => addExperience() },
                  { name: 'Availability Badge', action: () => setSelectedElement({ type: 'contact', id: 'contact-status', label: 'Availability Indicator' }) },
                  { name: 'Navigation Link', action: () => addNavItem() }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400 hover:bg-sky-500/10 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[10px] text-emerald-400 font-mono mb-1">+ Insert</div>
                    <div className="font-medium text-slate-200 group-hover:text-white text-[11px]">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Wrappers */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="text-[11px] font-mono text-sky-400 uppercase">
                Layout Structures
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['2-Column Split', '3-Column Grid', 'Bento Showcase', 'Centered Frame'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => addSection('custom', layout)}
                    className="p-2 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400 text-left transition-colors text-[11px] text-slate-300 hover:text-white"
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: NAVIGATOR / LAYERS TREE */}
        {/* ======================================================== */}
        {activeTab === 'navigator' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                DOCUMENT NAVIGATOR
              </h3>
              <p className="text-[11px] text-slate-400">
                Visual hierarchy of active page elements
              </p>
            </div>

            <div className="space-y-1 font-mono text-xs">
              {/* Home Node */}
              <div className="p-2 rounded-lg bg-[#121620] border border-white/[0.06]">
                <div
                  onClick={() =>
                    setSelectedElement({
                      type: 'hero',
                      id: 'sec-hero',
                      label: 'Hero Section',
                      sublabel: draftData.personal.fullName
                    })
                  }
                  className="flex items-center gap-2 cursor-pointer text-white hover:text-sky-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold">01. Hero / Home</span>
                </div>
                <div className="ml-5 mt-1 space-y-1 text-[11px] text-slate-400">
                  <div
                    onClick={() =>
                      setSelectedElement({
                        type: 'text',
                        id: 'hero-headline',
                        field: 'personal.headline',
                        label: 'Hero Headline'
                      })
                    }
                    className="cursor-pointer hover:text-sky-300"
                  >
                    ├─ Headline: "{draftData.personal.fullName}"
                  </div>
                  <div
                    onClick={() =>
                      setSelectedElement({
                        type: 'image',
                        id: 'hero-avatar',
                        field: 'personal.avatarUrl',
                        label: 'Profile Portrait Avatar'
                      })
                    }
                    className="cursor-pointer hover:text-sky-300"
                  >
                    ├─ Profile Avatar Image
                  </div>
                  <div
                    onClick={() =>
                      setSelectedElement({
                        type: 'button',
                        id: 'hero-ctas',
                        label: 'Action CTAs'
                      })
                    }
                    className="cursor-pointer hover:text-sky-300"
                  >
                    └─ Call-to-Actions (Work & Contact)
                  </div>
                </div>
              </div>

              {/* About Node */}
              <div
                onClick={() =>
                  setSelectedElement({
                    type: 'about',
                    id: 'sec-about',
                    label: 'About the Creator'
                  })
                }
                className="p-2 rounded-lg bg-[#121620] border border-white/[0.06] cursor-pointer text-slate-300 hover:text-white hover:border-sky-400/40"
              >
                <span className="font-semibold text-white">02. About Narrative</span>
                <div className="text-[10px] text-slate-500 mt-0.5">2 Narrative Paragraphs · 3 Core Pillars</div>
              </div>

              {/* Skills Node */}
              <div
                onClick={() =>
                  setSelectedElement({
                    type: 'skill',
                    id: draftData.skills[0]?.id || 'skill-default',
                    label: 'Skills Section'
                  })
                }
                className="p-2 rounded-lg bg-[#121620] border border-white/[0.06] cursor-pointer text-slate-300 hover:text-white hover:border-sky-400/40"
              >
                <span className="font-semibold text-white">03. Skills & Arsenal</span>
                <div className="text-[10px] text-slate-500 mt-0.5">{draftData.skills.length} Competencies Cataloged</div>
              </div>

              {/* Services Node */}
              <div
                onClick={() =>
                  setSelectedElement({
                    type: 'service',
                    id: draftData.services[0]?.id || 'service-default',
                    label: 'Services Section'
                  })
                }
                className="p-2 rounded-lg bg-[#121620] border border-white/[0.06] cursor-pointer text-slate-300 hover:text-white hover:border-sky-400/40"
              >
                <span className="font-semibold text-white">04. Services</span>
                <div className="text-[10px] text-slate-500 mt-0.5">{draftData.services.length} Service Offerings</div>
              </div>

              {/* Projects Node */}
              <div
                onClick={() =>
                  setSelectedElement({
                    type: 'project',
                    id: draftData.projects[0]?.id || 'project-default',
                    label: 'Projects Showcase'
                  })
                }
                className="p-2 rounded-lg bg-[#121620] border border-white/[0.06] cursor-pointer text-slate-300 hover:text-white hover:border-sky-400/40"
              >
                <span className="font-semibold text-white">05. Selected Projects</span>
                <div className="text-[10px] text-slate-500 mt-0.5">{draftData.projects.length} Works · Live Simulator</div>
              </div>

              {/* Experience Node */}
              <div
                onClick={() =>
                  setSelectedElement({
                    type: 'experience',
                    id: draftData.experience[0]?.id || 'exp-default',
                    label: 'Career Milestones'
                  })
                }
                className="p-2 rounded-lg bg-[#121620] border border-white/[0.06] cursor-pointer text-slate-300 hover:text-white hover:border-sky-400/40"
              >
                <span className="font-semibold text-white">06. Experience Timeline</span>
                <div className="text-[10px] text-slate-500 mt-0.5">{draftData.experience.length} Track Milestones</div>
              </div>

              {/* Contact Node */}
              <div
                onClick={() =>
                  setSelectedElement({
                    type: 'contact',
                    id: 'sec-contact',
                    label: 'Contact & Collaboration'
                  })
                }
                className="p-2 rounded-lg bg-[#121620] border border-white/[0.06] cursor-pointer text-slate-300 hover:text-white hover:border-sky-400/40"
              >
                <span className="font-semibold text-white">07. Contact & Hiring</span>
                <div className="text-[10px] text-slate-500 mt-0.5">Availability Pulse · Direct Channels · Form</div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CONTENT MANAGERS */}
        {/* ======================================================== */}
        {activeTab === 'managers' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                CONTENT MANAGERS
              </h3>
              <p className="text-[11px] text-slate-400">
                Specialized visual data entity managers
              </p>
            </div>

            {/* Subtab selection pills */}
            <div className="flex flex-wrap gap-1 p-1 bg-[#090b10] rounded-xl border border-white/[0.08] text-xs">
              {[
                { id: 'projects', label: 'Projects' },
                { id: 'skills', label: 'Skills' },
                { id: 'services', label: 'Services' },
                { id: 'experience', label: 'Experience' },
                { id: 'navigation', label: 'Navigation' },
                { id: 'hero', label: 'Hero' },
                { id: 'contact', label: 'Contact' },
                { id: 'intro', label: 'Intro' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setManagerSubtab(sub.id as ContentManagerSubtab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    managerSubtab === sub.id
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* SUBTAB: PROJECTS */}
            {managerSubtab === 'projects' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Projects Catalog</span>
                  <button
                    onClick={() => addProject()}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {draftData.projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() =>
                        setSelectedElement({
                          type: 'project',
                          id: proj.id,
                          label: proj.title,
                          sublabel: proj.category
                        })
                      }
                      className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-semibold text-white truncate">{proj.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{proj.category}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => duplicateProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB: SKILLS */}
            {managerSubtab === 'skills' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Skills Catalog</span>
                  <button
                    onClick={() => addSkill()}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {draftData.skills.map((skill) => (
                    <div
                      key={skill.id}
                      onClick={() =>
                        setSelectedElement({
                          type: 'skill',
                          id: skill.id,
                          label: skill.name,
                          sublabel: `${skill.proficiencyPercentage}%`
                        })
                      }
                      className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-semibold text-white truncate">{skill.name}</div>
                        <div className="text-[10px] text-sky-400 font-mono">{skill.proficiencyPercentage}% Proficiency</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => duplicateSkill(skill.id)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB: SERVICES */}
            {managerSubtab === 'services' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Services Offerings</span>
                  <button
                    onClick={() => addService()}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {draftData.services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() =>
                        setSelectedElement({
                          type: 'service',
                          id: srv.id,
                          label: srv.title
                        })
                      }
                      className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-semibold text-white truncate">{srv.editorialNumber}. {srv.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{srv.category}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => duplicateService(srv.id)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteService(srv.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB: EXPERIENCE */}
            {managerSubtab === 'experience' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Experience Milestones</span>
                  <button
                    onClick={() => addExperience()}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {draftData.experience.map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() =>
                        setSelectedElement({
                          type: 'experience',
                          id: exp.id,
                          label: exp.role
                        })
                      }
                      className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-semibold text-white truncate">{exp.role}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{exp.period}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => duplicateExperience(exp.id)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteExperience(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB: NAVIGATION */}
            {managerSubtab === 'navigation' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Navigation Links</span>
                  <button
                    onClick={() => addNavItem()}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {draftData.navigation.map((nav) => (
                    <div
                      key={nav.id}
                      onClick={() =>
                        setSelectedElement({
                          type: 'navigation',
                          id: nav.id,
                          label: `Nav: ${nav.label}`
                        })
                      }
                      className="p-2.5 rounded-lg border border-white/[0.08] bg-[#121620] hover:border-sky-400/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-semibold text-white truncate">{nav.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{nav.href}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNavItem(nav.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB: HERO */}
            {managerSubtab === 'hero' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white">Hero / Home Controls</span>
                <button
                  onClick={() =>
                    setSelectedElement({
                      type: 'hero',
                      id: 'sec-hero',
                      label: 'Hero Section Settings'
                    })
                  }
                  className="w-full py-2 px-3 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-medium hover:bg-sky-500/20 transition-colors"
                >
                  Configure Hero in Inspector →
                </button>
              </div>
            )}

            {/* SUBTAB: CONTACT */}
            {managerSubtab === 'contact' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white">Contact & Hiring Controls</span>
                <button
                  onClick={() =>
                    setSelectedElement({
                      type: 'contact',
                      id: 'sec-contact',
                      label: 'Contact & Hiring Settings'
                    })
                  }
                  className="w-full py-2 px-3 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-medium hover:bg-sky-500/20 transition-colors"
                >
                  Configure Contact in Inspector →
                </button>
              </div>
            )}

            {/* SUBTAB: INTRO */}
            {managerSubtab === 'intro' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-white">Opening Animation Setup</span>
                <button
                  onClick={() =>
                    setSelectedElement({
                      type: 'intro',
                      id: 'intro-settings',
                      label: 'Intro Animation Settings'
                    })
                  }
                  className="w-full py-2 px-3 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-medium hover:bg-sky-500/20 transition-colors"
                >
                  Configure Intro in Inspector →
                </button>
                <button
                  onClick={replayIntro}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors"
                >
                  <Play className="w-3 h-3 text-sky-400" />
                  <span>Test Replay Intro</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MEDIA MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                  MEDIA MANAGER
                </h3>
                <p className="text-[11px] text-slate-400">
                  {draftData.media.length} assets · High-res vault
                </p>
              </div>

              {/* Upload input button */}
              <label className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept={PORTFOLIO_IMAGE_ACCEPT}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = '';
                  }}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Launch Full Media Vault Button */}
            <button
              onClick={() => openMediaPicker(() => {}, 'all')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-400/30 hover:border-sky-400 text-sky-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Open Full Media Vault & Explorer</span>
            </button>

            {mediaUploadSuccess && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Image added to library!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {draftData.media.map((media) => {
                const usages = getMediaUsage(media.id);
                return (
                  <div
                    key={media.id}
                    onClick={() =>
                      setSelectedElement({
                        type: 'image',
                        id: media.id,
                        field: media.url,
                        label: media.name
                      })
                    }
                    className="rounded-xl border border-white/[0.08] bg-[#121620] overflow-hidden hover:border-sky-400 transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full bg-[#090b10] overflow-hidden relative flex items-center justify-center">
                      {media.url && media.url.trim() ? (
                        <img
                          src={media.url.trim()}
                          alt={media.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                      )}
                      {usages.length > 0 && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono text-white">
                          {usages.length} uses
                        </span>
                      )}
                    </div>
                    <div className="p-2 text-left">
                      <div className="text-[11px] font-semibold text-white truncate">{media.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                        <span>{media.fileSize || 'Standard'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMediaItem(media.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: GLOBAL STYLES & THEME */}
        {/* ======================================================== */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-mono tracking-wider text-white">
                GLOBAL STYLES & TOKENS
              </h3>
              <p className="text-[11px] text-slate-400">
                Design system, theme presets & typography
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-sky-400 uppercase">
                Theme Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'obsidian', name: 'Obsidian Minimal', color: '#38bdf8' },
                  { id: 'titanium', name: 'Titanium Teal', color: '#2dd4bf' },
                  { id: 'amber-gold', name: 'Warm Amber', color: '#f59e0b' },
                  { id: 'emerald', name: 'Deep Emerald', color: '#10b981' },
                  { id: 'minimal-light', name: 'Clean Light', color: '#0284c7' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, preset: preset.id as any }
                      }))
                    }
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      draftData.theme.preset === preset.id
                        ? 'bg-sky-500/10 border-sky-400 text-white'
                        : 'bg-[#121620] border-white/[0.08] text-slate-300 hover:border-white/[0.2]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.color }} />
                    <span className="truncate text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Accent Color */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <label className="text-[11px] font-mono text-sky-400 uppercase">
                Accent Glow Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draftData.theme.accentColor}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, accentColor: e.target.value }
                    }))
                  }
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300">{draftData.theme.accentColor}</span>
              </div>
            </div>

            {/* Border Radius */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <label className="text-[11px] font-mono text-sky-400 uppercase">
                Border Radius Scale
              </label>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {(['none', 'sm', 'md', 'lg'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, borderRadius: r }
                      }))
                    }
                    className={`p-1.5 rounded-lg border text-center font-mono capitalize transition-colors ${
                      draftData.theme.borderRadius === r
                        ? 'bg-sky-500 text-white border-sky-400'
                        : 'bg-[#121620] border-white/[0.08] text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Animations Toggle */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Subtle Animations</div>
                <div className="text-[10px] text-slate-400">Section reveals & hovers</div>
              </div>
              <input
                type="checkbox"
                checked={draftData.theme.animationsEnabled}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    theme: { ...prev.theme, animationsEnabled: e.target.checked }
                  }))
                }
                className="w-4 h-4 text-sky-400 rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
