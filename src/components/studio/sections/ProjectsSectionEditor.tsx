import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { ProjectItem } from '../../../types/portfolio';
import { mediaService } from '../../../services/mediaService';
import {
  Folder,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Star,
  Check,
  Edit2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  Wrench,
  Code,
  Tag,
  Link,
  X,
  AlertTriangle,
  Upload,
  RefreshCw,
  FolderPlus,
  Sparkles,
  Globe,
  Download,
  ShieldCheck
} from 'lucide-react';
import { MobileImageUploadField } from '../../common/MobileImageUploadField';
import { PORTFOLIO_IMAGE_ACCEPT, uploadLocalFile } from '../../../utils/fileUploadHelper';
import { apiRequest } from '../../../services/apiClient';

const DEFAULT_CATEGORIES = [
  'Web Applications',
  'Web Development',
  'WordPress',
  'E-commerce',
  'Shopify',
  'UI/UX Design',
  'Graphic Design',
  '3D & Branding',
  'Video & Motion'
];

const SCOPE_OPTIONS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'E-commerce',
  'Graphic Design',
  'UI/UX',
  'SEO',
  'Other'
];

const METHOD_OPTIONS = [
  'Custom Code',
  'WordPress',
  'Shopify',
  'Elementor',
  'WPBakery',
  'Drag & Drop',
  'AI Generated / AI-Assisted',
  'Custom + AI',
  'Other'
];

const DRAG_BUILDER_OPTIONS = [
  'Elementor',
  'Webflow',
  'Wix',
  'Framer',
  'Divi',
  'Other'
];

const COMMON_TECHNOLOGIES = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Tailwind CSS',
  'Bootstrap',
  'jQuery',
  'PHP',
  'WordPress',
  'Shopify',
  'Supabase',
  'PostgreSQL',
  'GraphQL',
  'Python',
  'Three.js'
];

const COMMON_SERVICES = [
  'Web Development',
  'Web Design',
  'UI/UX',
  'Graphic Design',
  'Logo Design',
  'SEO',
  'Video Editing',
  '3D Design',
  'E-commerce Setup',
  'API Integration'
];

export const ProjectsSectionEditor: React.FC = () => {
  const {
    draftData,
    updateData,
    addProject,
    updateProject,
    deleteProject,
    duplicateProject,
    reorderProjects,
    openMediaPicker,
    addProjectGalleryImage,
    removeProjectGalleryImage,
    reorderProjectGallery,
    setProjectMainImage
  } = usePortfolio();

  const projects = draftData.projects || [];

  // Editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'stack' | 'gallery' | 'links'>('basic');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Category Manager modal state
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryOld, setEditingCategoryOld] = useState<string | null>(null);
  const [editingCategoryNew, setEditingCategoryNew] = useState('');
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);

  // Custom tech input state
  const [customTechInput, setCustomTechInput] = useState('');

  // Local uploading state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // URL preview fetching state
  const [isFetchingUrlPreview, setIsFetchingUrlPreview] = useState(false);
  const [urlPreviewResult, setUrlPreviewResult] = useState<{
    success: boolean;
    url?: string;
    title?: string;
    description?: string;
    ogImage?: string;
    images?: string[];
    screenshotUrl?: string;
    previewEmbedAllowed?: boolean;
    warning?: string;
    error?: string;
  } | null>(null);

  // Combined manageable categories
  const categoriesList = useMemo(() => {
    const fromProjects = projects.map((p) => p.category).filter(Boolean);
    const fromCustom = draftData.projectCategories || [];
    const set = new Set<string>([...DEFAULT_CATEGORIES, ...fromProjects, ...fromCustom]);
    return Array.from(set);
  }, [projects, draftData.projectCategories]);

  // Current project being edited
  const currentProject = useMemo(() => {
    if (!editingProjectId) return null;
    return projects.find((p) => p.id === editingProjectId) || null;
  }, [projects, editingProjectId]);

  const handleFetchUrlPreview = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || currentProject?.liveUrl || '').trim();
    if (!targetUrl) return;

    setIsFetchingUrlPreview(true);
    setUrlPreviewResult(null);

    try {
      const res = await apiRequest<{
        success: boolean;
        url?: string;
        title?: string;
        description?: string;
        ogImage?: string;
        images?: string[];
        screenshotUrl?: string;
        previewEmbedAllowed?: boolean;
        warning?: string;
        error?: string;
      }>('/api/projects/fetch-url-preview', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl })
      });

      setUrlPreviewResult(res);

      if (currentProject) {
        const updates: Partial<ProjectItem> = {};
        if (res.title && (!currentProject.title || currentProject.title.startsWith('New Project'))) {
          updates.title = res.title;
        }
        if (res.description && (!currentProject.shortDescription || currentProject.shortDescription.length < 5)) {
          updates.shortDescription = res.description;
        }
        if (typeof res.previewEmbedAllowed === 'boolean') {
          updates.previewEmbedAllowed = res.previewEmbedAllowed;
        }
        if (res.ogImage && !currentProject.imageUrl) {
          updates.imageUrl = res.ogImage;
        }
        if (Object.keys(updates).length > 0) {
          updateProject(currentProject.id, updates);
        }
      }
    } catch (err: any) {
      setUrlPreviewResult({
        success: false,
        error: err.message || 'Failed to connect to website preview service.'
      });
    } finally {
      setIsFetchingUrlPreview(false);
    }
  };

  // Category Management Handlers
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || categoriesList.includes(trimmed)) return;
    updateData((prev) => ({
      ...prev,
      projectCategories: [...(prev.projectCategories || []), trimmed]
    }));
    setNewCategoryName('');
  };

  const handleRenameCategory = (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCategoryOld(null);
      return;
    }
    // Update all projects using oldCat
    updateData((prev) => ({
      ...prev,
      projectCategories: (prev.projectCategories || []).map((c) => (c === oldCat ? trimmed : c)),
      projects: prev.projects.map((p) => (p.category === oldCat ? { ...p, category: trimmed } : p))
    }));
    setEditingCategoryOld(null);
  };

  const handleDeleteCategory = (cat: string) => {
    // Check if in use
    const inUseCount = projects.filter((p) => p.category === cat).length;
    if (inUseCount > 0) {
      setCategoryWarning(`Cannot delete "${cat}": It is currently assigned to ${inUseCount} project(s). Reassign them first.`);
      return;
    }
    setCategoryWarning(null);
    updateData((prev) => ({
      ...prev,
      projectCategories: (prev.projectCategories || []).filter((c) => c !== cat)
    }));
  };

  // Helper to start creating a new project
  const handleStartCreate = () => {
    const newId = `proj-${Date.now()}`;
    const newProj: ProjectItem = {
      id: newId,
      title: 'New Showcase Project',
      category: categoriesList[0] || 'Web Applications',
      shortDescription: 'High-impact digital project delivered with precision.',
      fullDescription: 'Comprehensive case study detailing architecture, user experience, and measurable business impact.',
      imageUrl: '/assets/images/showcase_web_saas_1791008421310.jpg',
      galleryImages: [],
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      servicesPerformed: ['Web Development', 'UI/UX'],
      projectScope: 'Full Stack',
      developmentMethod: 'Custom Code',
      isVisible: true,
      isFeatured: true,
      isPopular: false,
      previewEmbedAllowed: true,
      order: projects.length + 1
    };
    addProject(newProj);
    setEditingProjectId(newId);
    setIsCreatingNew(true);
    setActiveModalTab('basic');
  };

  // Reorder single project up or down
  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    reorderProjects(index, targetIndex);
  };

  // Upload local images directly to Supabase Storage
  const handleUploadProjectImages = async (
    files: FileList | File[],
    targetProjectId: string,
    setAsMain: boolean = false
  ) => {
    setIsUploadingImage(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        let uploadedUrl = dataUrl;
        try {
          const uploaded = await mediaService.upload({
            dataUrl,
            filename: file.name,
            name: `${currentProject?.title || 'Project'} - ${file.name}`,
            mimeType: file.type || 'image/jpeg',
            altText: `${currentProject?.title || 'Project'} screenshot`
          });
          if (uploaded && uploaded.url) {
            uploadedUrl = uploaded.url;
          }
        } catch (e) {
          console.warn('[ProjectEditor] Direct storage upload failed, using local vault:', e);
        }

        if (setAsMain) {
          updateProject(targetProjectId, { imageUrl: uploadedUrl });
        } else {
          addProjectGalleryImage(targetProjectId, uploadedUrl);
        }
      } catch (err) {
        console.error('[ProjectEditor] Upload error:', err);
      }
    }
    setIsUploadingImage(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📁 Project Manager & Showcase</span>
            <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/[0.06]">
              {projects.length} Works
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visually manage case studies, multiple gallery images, custom categories, builders, and live links.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0d1117] border border-white/[0.08] text-center space-y-3">
            <Folder className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No projects found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start by adding your first project showcase or case study to display on the portfolio.
            </p>
            <button
              onClick={handleStartCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
            >
              Add First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {projects.map((proj, idx) => {
              const isDeleting = confirmDeleteId === proj.id;
              const galleryCount = (proj.galleryImages || []).length;

              return (
                <div
                  key={proj.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-[#0d1117] border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    proj.isVisible !== false
                      ? 'border-white/[0.08] hover:border-white/[0.18]'
                      : 'border-white/[0.04] opacity-60 bg-[#090b10]'
                  }`}
                >
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    {/* Cover Thumbnail with Quick Picker */}
                    <div
                      onClick={() => {
                        openMediaPicker((m) => updateProject(proj.id, { imageUrl: m.url }), 'image');
                      }}
                      className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden bg-[#161c26] shrink-0 border border-white/10 relative group cursor-pointer"
                      title="Click to replace cover image"
                    >
                      {proj.imageUrl ? (
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Folder className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                        Change
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-400/20">
                          {proj.category}
                        </span>

                        {proj.developmentMethod && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/10">
                            {proj.developmentMethod}
                            {proj.dragAndDropBuilder ? ` (${proj.dragAndDropBuilder})` : ''}
                          </span>
                        )}

                        {proj.projectScope && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/5">
                            {proj.projectScope}
                          </span>
                        )}

                        {galleryCount > 0 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            +{galleryCount} gallery images
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white truncate">{proj.title}</h3>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {proj.shortDescription}
                      </p>

                      {/* Tech Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {(proj.technologies || []).slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-300 border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                        {(proj.technologies || []).length > 4 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            +{proj.technologies.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.06]">
                    {/* Move Up / Down */}
                    <div className="flex items-center rounded-lg bg-white/[0.04] border border-white/10 p-0.5">
                      <button
                        onClick={() => handleMoveProject(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveProject(idx, 'down')}
                        disabled={idx === projects.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => updateProject(proj.id, { isVisible: proj.isVisible === false })}
                      title={proj.isVisible !== false ? 'Visible on Portfolio' : 'Hidden from Portfolio'}
                      className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                        proj.isVisible !== false
                          ? 'bg-sky-500/10 text-sky-400 border-sky-400/20'
                          : 'bg-white/[0.04] text-slate-500 border-white/10'
                      }`}
                    >
                      {proj.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Featured Toggle */}
                    <button
                      onClick={() => updateProject(proj.id, { isFeatured: !proj.isFeatured })}
                      title={proj.isFeatured ? 'Featured on Home' : 'Not Featured'}
                      className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                        proj.isFeatured
                          ? 'bg-amber-500/10 text-amber-400 border-amber-400/20'
                          : 'bg-white/[0.04] text-slate-500 border-white/10'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>

                    {/* Duplicate Project */}
                    <button
                      onClick={() => duplicateProject(proj.id)}
                      title="Duplicate Project"
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit Project */}
                    <button
                      onClick={() => {
                        setEditingProjectId(proj.id);
                        setIsCreatingNew(false);
                        setActiveModalTab('basic');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Project</span>
                    </button>

                    {/* Delete with Confirmation */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-xl border border-rose-500/30">
                        <span className="text-[11px] text-rose-300 font-semibold px-1">Delete?</span>
                        <button
                          onClick={() => {
                            deleteProject(proj.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded hover:bg-white/10 text-slate-400 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(proj.id)}
                        title="Delete Project"
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================
          EDIT / ADD PROJECT MODAL DIALOG
          ======================================================================== */}
      {currentProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-4xl max-h-[92vh] bg-[#0c0f16] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#090b10]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{isCreatingNew ? 'Create Showcase Project' : 'Edit Project Details'}</span>
                    <span className="text-xs font-mono text-slate-400 font-normal truncate max-w-xs">
                      ({currentProject.title})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Non-technical visual controls for description, multi-image gallery, tech stack, and links.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingProjectId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Selector */}
            <div className="px-6 py-2.5 border-b border-white/10 bg-[#0f131a] flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveModalTab('basic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'basic' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Basic Info
              </button>
              <button
                onClick={() => setActiveModalTab('stack')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'stack' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Builder & Tech Stack
              </button>
              <button
                onClick={() => setActiveModalTab('gallery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'gallery' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Images & Gallery ({1 + (currentProject.galleryImages || []).length})
              </button>
              <button
                onClick={() => setActiveModalTab('links')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeModalTab === 'links' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                4. Live Links & Meta
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: BASIC INFORMATION */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={currentProject.title}
                      onChange={(e) => updateProject(currentProject.id, { title: e.target.value })}
                      placeholder="e.g. Apex Analytics Platform"
                      className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                    />
                  </div>

                  {/* Category & Scope */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-300">Category</label>
                        <button
                          type="button"
                          onClick={() => setIsCategoryManagerOpen(true)}
                          className="text-[11px] text-sky-400 hover:underline"
                        >
                          + Manage Categories
                        </button>
                      </div>
                      <select
                        value={currentProject.category}
                        onChange={(e) => updateProject(currentProject.id, { category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none cursor-pointer"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Project Scope / Type
                      </label>
                      <select
                        value={currentProject.projectScope || 'Full Stack'}
                        onChange={(e) => updateProject(currentProject.id, { projectScope: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none cursor-pointer"
                      >
                        {SCOPE_OPTIONS.map((scope) => (
                          <option key={scope} value={scope}>
                            {scope}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Short Overview (Card Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={currentProject.shortDescription}
                      onChange={(e) => updateProject(currentProject.id, { shortDescription: e.target.value })}
                      placeholder="Concise 1-2 sentence overview shown on portfolio cards..."
                      className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none resize-y"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Detailed Case Study / Description
                    </label>
                    <textarea
                      rows={4}
                      value={currentProject.fullDescription || ''}
                      onChange={(e) => updateProject(currentProject.id, { fullDescription: e.target.value })}
                      placeholder="Full case study narrative, client requirements, solutions implemented, and technical results..."
                      className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none resize-y"
                    />
                  </div>

                  {/* Visibility & Status Switches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#161c26] border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentProject.isVisible !== false}
                        onChange={(e) => updateProject(currentProject.id, { isVisible: e.target.checked })}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">Visible on Public Portfolio</span>
                        <span className="text-[11px] text-slate-400">Show this card in the featured projects section</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!currentProject.isFeatured}
                        onChange={(e) => updateProject(currentProject.id, { isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">Mark as Featured Highlight</span>
                        <span className="text-[11px] text-slate-400">Gives priority visibility and star badge</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: BUILDER & TECH STACK */}
              {activeModalTab === 'stack' && (
                <div className="space-y-6">
                  {/* Development Method / Builder */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-white">
                      Development Method / Builder
                    </label>
                    <p className="text-xs text-slate-400">
                      Indicate how this client deliverable was engineered or constructed.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {METHOD_OPTIONS.map((method) => {
                        const isSelected = (currentProject.developmentMethod || 'Custom Code') === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => updateProject(currentProject.id, { developmentMethod: method })}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500/10 border-sky-400 text-white shadow-xs'
                                : 'bg-[#161c26] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{method}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Conditional reveal if Drag & Drop is selected */}
                    {currentProject.developmentMethod === 'Drag & Drop' && (
                      <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-400/20 space-y-2 mt-3 animate-in fade-in">
                        <label className="block text-xs font-semibold text-sky-300">
                          Specific Visual Builder Used:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DRAG_BUILDER_OPTIONS.map((builder) => {
                            const isBuilderActive = currentProject.dragAndDropBuilder === builder;
                            return (
                              <button
                                key={builder}
                                type="button"
                                onClick={() => updateProject(currentProject.id, { dragAndDropBuilder: builder })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                  isBuilderActive
                                    ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                                    : 'bg-[#121620] border-white/10 text-slate-300 hover:text-white'
                                }`}
                              >
                                {builder}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technologies Used (Selectable Buttons/Chips) */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold text-white">
                      Technologies Used
                    </label>
                    <p className="text-xs text-slate-400">
                      Click chips to toggle technologies. No free-text code syntax required.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {COMMON_TECHNOLOGIES.map((tech) => {
                        const isTechActive = (currentProject.technologies || []).includes(tech);
                        return (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => {
                              const currentTechs = currentProject.technologies || [];
                              const updated = isTechActive
                                ? currentTechs.filter((t) => t !== tech)
                                : [...currentTechs, tech];
                              updateProject(currentProject.id, { technologies: updated });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                              isTechActive
                                ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-xs'
                                : 'bg-[#161c26] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Tech Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={customTechInput}
                        onChange={(e) => setCustomTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customTechInput.trim()) {
                              const currentTechs = currentProject.technologies || [];
                              if (!currentTechs.includes(customTechInput.trim())) {
                                updateProject(currentProject.id, {
                                  technologies: [...currentTechs, customTechInput.trim()]
                                });
                              }
                              setCustomTechInput('');
                            }
                          }
                        }}
                        placeholder="Add custom technology (e.g. Prisma, Docker, WebGL)..."
                        className="px-3 py-1.5 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs outline-none focus:border-sky-400 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customTechInput.trim()) {
                            const currentTechs = currentProject.technologies || [];
                            if (!currentTechs.includes(customTechInput.trim())) {
                              updateProject(currentProject.id, {
                                technologies: [...currentTechs, customTechInput.trim()]
                              });
                            }
                            setCustomTechInput('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold cursor-pointer"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Services / Work Performed */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold text-white">
                      Services / Work Performed
                    </label>
                    <p className="text-xs text-slate-400">
                      Select specific consulting or design disciplines delivered.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {COMMON_SERVICES.map((srv) => {
                        const isSrvActive = (currentProject.servicesPerformed || []).includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => {
                              const currentSrvs = currentProject.servicesPerformed || [];
                              const updated = isSrvActive
                                ? currentSrvs.filter((s) => s !== srv)
                                : [...currentSrvs, srv];
                              updateProject(currentProject.id, { servicesPerformed: updated });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                              isSrvActive
                                ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                                : 'bg-[#161c26] border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {srv}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Related Skills from Existing Skills List */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold text-white">
                      Related Skills (From Portfolio Competencies)
                    </label>
                    <p className="text-xs text-slate-400">
                      Link skills defined in your Skills section without duplicate records.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(draftData.skills || []).map((sk) => {
                        const isSkillLinked = (currentProject.skillsUsed || []).includes(sk.name);
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => {
                              const currentSkills = currentProject.skillsUsed || [];
                              const updated = isSkillLinked
                                ? currentSkills.filter((s) => s !== sk.name)
                                : [...currentSkills, sk.name];
                              updateProject(currentProject.id, { skillsUsed: updated });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                              isSkillLinked
                                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                                : 'bg-[#161c26] border-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {sk.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IMAGES & MULTI-IMAGE GALLERY */}
              {activeModalTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Cover / Main Image */}
                  <div className="p-4 rounded-xl bg-[#161c26] border border-white/10 space-y-3">
                    <MobileImageUploadField
                      label="Cover / Main Image"
                      description="Displayed on the public portfolio card and as the primary hero shot. Tap to choose directly from mobile gallery."
                      value={currentProject.imageUrl || ''}
                      onChange={(url) => updateProject(currentProject.id, { imageUrl: url })}
                      onOpenVault={() => {
                        openMediaPicker((media) => {
                          updateProject(currentProject.id, { imageUrl: media.url });
                        }, 'image');
                      }}
                      aspectRatio="video"
                      allowClear={false}
                    />
                  </div>

                  {/* Full-Page Website Preview Image (Interactive Vertical Scroll on Card) */}
                  <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                    <MobileImageUploadField
                      label="Full-Page Website Preview Screenshot"
                      description="Long full-page website screenshot. Desktop visitors can hover over the card to smoothly scroll through the complete page from header to footer. Select from mobile gallery or device files."
                      value={currentProject.fullWebsitePreviewUrl || ''}
                      onChange={(url) =>
                        updateProject(currentProject.id, {
                          fullWebsitePreviewUrl: url || undefined,
                          hasFullPagePreview: !!url
                        })
                      }
                      onOpenVault={() => {
                        openMediaPicker((media) => {
                          updateProject(currentProject.id, {
                            fullWebsitePreviewUrl: media.url,
                            hasFullPagePreview: true
                          });
                        }, 'image');
                      }}
                      aspectRatio="video"
                      allowClear={true}
                      placeholderText="Select or upload long webpage screenshot..."
                    />
                  </div>

                  {/* Project Gallery (Multiple Images) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Project Gallery (Screenshots & Mockups)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Add multiple images to showcase workflows, mobile screens, and design details.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            openMediaPicker((media) => {
                              addProjectGalleryImage(currentProject.id, media.url);
                            }, 'image');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-sky-400" />
                          <span>Add from Vault</span>
                        </button>

                        <label className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Photos from Gallery</span>
                          <input
                            type="file"
                            multiple
                            accept={PORTFOLIO_IMAGE_ACCEPT}
                            onClick={(e) => {
                              // Reset so selecting again triggers change on mobile
                              (e.target as HTMLInputElement).value = '';
                            }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleUploadProjectImages(e.target.files, currentProject.id, false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {isUploadingImage && (
                      <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                        <span>Uploading images to Supabase Storage...</span>
                      </div>
                    )}

                    {(currentProject.galleryImages || []).length === 0 ? (
                      <div className="p-8 rounded-xl bg-[#161c26]/60 border border-dashed border-white/10 text-center space-y-2">
                        <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-300">No additional gallery images yet</p>
                        <p className="text-[11px] text-slate-500">
                          Upload screenshots or pick existing media to build an interactive gallery.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(currentProject.galleryImages || []).map((imgUrl, gIdx) => (
                          <div
                            key={gIdx}
                            className="group relative rounded-xl overflow-hidden bg-[#161c26] border border-white/10 flex flex-col"
                          >
                            <div className="aspect-video relative overflow-hidden bg-black/40">
                              <img
                                src={imgUrl}
                                alt={`Gallery ${gIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                                #{gIdx + 1}
                              </span>
                            </div>

                            <div className="p-2 flex items-center justify-between bg-[#121620] border-t border-white/5">
                              {/* Set as Cover */}
                              <button
                                type="button"
                                onClick={() => setProjectMainImage(currentProject.id, imgUrl)}
                                className="text-[10px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                              >
                                Set as Cover
                              </button>

                              <div className="flex items-center gap-1">
                                {/* Move Left / Right */}
                                <button
                                  type="button"
                                  disabled={gIdx === 0}
                                  onClick={() => reorderProjectGallery(currentProject.id, gIdx, gIdx - 1)}
                                  className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                  title="Move earlier"
                                >
                                  <ArrowUp className="w-3 h-3 rotate-270" />
                                </button>
                                <button
                                  type="button"
                                  disabled={gIdx === (currentProject.galleryImages?.length || 0) - 1}
                                  onClick={() => reorderProjectGallery(currentProject.id, gIdx, gIdx + 1)}
                                  className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                                  title="Move later"
                                >
                                  <ArrowDown className="w-3 h-3 rotate-270" />
                                </button>
                                {/* Remove */}
                                <button
                                  type="button"
                                  onClick={() => removeProjectGalleryImage(currentProject.id, gIdx)}
                                  className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                                  title="Remove from gallery"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LIVE LINKS & META */}
              {activeModalTab === 'links' && (
                <div className="space-y-4">
                  {/* Live URL */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Live Production / Demo URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={currentProject.liveUrl || ''}
                        onChange={(e) => updateProject(currentProject.id, { liveUrl: e.target.value })}
                        placeholder="https://client-demo.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white font-mono text-xs focus:border-sky-400 outline-none"
                      />
                      {currentProject.liveUrl && (
                        <a
                          href={currentProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-sky-400 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleFetchUrlPreview()}
                        disabled={!currentProject.liveUrl || isFetchingUrlPreview}
                        className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-xs"
                      >
                        {isFetchingUrlPreview ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Fetching...</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Fetch Website Assets</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter the live website URL and click "Fetch Website Assets" to automatically retrieve homepage thumbnails, meta description, and full-page previews.
                    </p>

                    {/* Fetched Website Preview Results Card */}
                    {urlPreviewResult && (
                      <div className="mt-3 p-4 rounded-xl bg-[#121620] border border-sky-400/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-sky-400" />
                            <h5 className="text-xs font-bold text-white uppercase font-mono">
                              Extracted Website Metadata & Thumbnails
                            </h5>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUrlPreviewResult(null)}
                            className="text-slate-400 hover:text-white text-xs cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {urlPreviewResult.title && (
                          <div className="text-xs text-slate-300">
                            <span className="font-semibold text-white">Extracted Title:</span> {urlPreviewResult.title}
                          </div>
                        )}

                        {urlPreviewResult.warning && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{urlPreviewResult.warning}</span>
                          </div>
                        )}

                        {urlPreviewResult.error && (
                          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{urlPreviewResult.error}</span>
                          </div>
                        )}

                        {/* Extracted Images & Screenshot Gallery */}
                        {((urlPreviewResult.images && urlPreviewResult.images.length > 0) || urlPreviewResult.screenshotUrl) && (
                          <div className="space-y-2 pt-1">
                            <span className="text-[11px] font-mono text-slate-400 block">
                              AVAILABLE WEBSITE IMAGES & SCREENSHOTS (TAP TO APPLY):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {urlPreviewResult.screenshotUrl && (
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between">
                                  <div className="aspect-video rounded overflow-hidden bg-black/50 relative">
                                    <img
                                      src={urlPreviewResult.screenshotUrl}
                                      alt="Homepage Screenshot"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[9px] text-sky-300 font-mono">
                                      Screenshot
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateProject(currentProject.id, { imageUrl: urlPreviewResult.screenshotUrl })}
                                      className="flex-1 py-1 px-1.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-medium text-center cursor-pointer"
                                    >
                                      Use as Cover
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateProject(currentProject.id, {
                                          fullWebsitePreviewUrl: urlPreviewResult.screenshotUrl,
                                          hasFullPagePreview: true
                                        })
                                      }
                                      className="flex-1 py-1 px-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-medium text-center cursor-pointer"
                                    >
                                      Use as Preview
                                    </button>
                                  </div>
                                </div>
                              )}

                              {(urlPreviewResult.images || []).slice(0, 5).map((imgUrl, i) => (
                                <div
                                  key={i}
                                  className="p-2 rounded-lg bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between"
                                >
                                  <div className="aspect-video rounded overflow-hidden bg-black/50 relative">
                                    <img
                                      src={imgUrl}
                                      alt={`Extracted ${i + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[9px] text-slate-300 font-mono">
                                      Asset #{i + 1}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateProject(currentProject.id, { imageUrl: imgUrl })}
                                      className="flex-1 py-1 px-1.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-medium text-center cursor-pointer"
                                    >
                                      Set Cover
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => addProjectGalleryImage(currentProject.id, imgUrl)}
                                      className="flex-1 py-1 px-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-[10px] font-medium text-center cursor-pointer"
                                    >
                                      + Gallery
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GitHub URL */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      GitHub Repository URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={currentProject.githubUrl || ''}
                      onChange={(e) => updateProject(currentProject.id, { githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white font-mono text-xs focus:border-sky-400 outline-none"
                    />
                  </div>

                  {/* Case Study URL */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      External Case Study URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={currentProject.caseStudyUrl || ''}
                      onChange={(e) => updateProject(currentProject.id, { caseStudyUrl: e.target.value })}
                      placeholder="https://medium.com/@... or Behance"
                      className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white font-mono text-xs focus:border-sky-400 outline-none"
                    />
                  </div>

                  {/* Metric / Highlight Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Highlighted Metric / Badge (e.g. "+35% Conversion")
                      </label>
                      <input
                        type="text"
                        value={currentProject.metricsOrHighlight || ''}
                        onChange={(e) => updateProject(currentProject.id, { metricsOrHighlight: e.target.value })}
                        placeholder="e.g. Enterprise Ready"
                        className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Client / Stakeholder Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentProject.clientName || ''}
                        onChange={(e) => updateProject(currentProject.id, { clientName: e.target.value })}
                        placeholder="e.g. Acme Corporation"
                        className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#090b10] flex items-center justify-between">
              <div className="text-xs text-slate-400">
                All changes automatically saved to Draft. Use "Publish" when ready.
              </div>

              <button
                onClick={() => setEditingProjectId(null)}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Done Editing Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          CATEGORY MANAGER MODAL
          ======================================================================== */}
      {isCategoryManagerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-[#0c0f16] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#090b10]">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Project Category Manager</h3>
              </div>
              <button
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setCategoryWarning(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {categoryWarning && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{categoryWarning}</span>
                </div>
              )}

              {/* Add New Category */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name (e.g. Mobile Apps)..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161c26] border border-white/10 text-white text-xs outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* List Categories */}
              <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
                {categoriesList.map((cat) => {
                  const isEditingThis = editingCategoryOld === cat;
                  const inUseCount = projects.filter((p) => p.category === cat).length;

                  return (
                    <div
                      key={cat}
                      className="p-2.5 rounded-xl bg-[#161c26] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCategoryNew}
                            onChange={(e) => setEditingCategoryNew(e.target.value)}
                            className="px-2 py-1 rounded bg-[#090b10] border border-white/10 text-white text-xs flex-1 outline-none focus:border-sky-400"
                          />
                          <button
                            onClick={() => handleRenameCategory(cat, editingCategoryNew)}
                            className="px-2.5 py-1 rounded bg-sky-500 text-slate-950 font-bold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategoryOld(null)}
                            className="px-2 py-1 rounded text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-white truncate">{cat}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ({inUseCount} projects)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingCategoryOld(cat);
                                setEditingCategoryNew(cat);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                              title="Edit name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-[#090b10] flex justify-end">
              <button
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setCategoryWarning(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
