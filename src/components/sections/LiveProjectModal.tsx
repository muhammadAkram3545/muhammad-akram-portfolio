import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../../types/portfolio';
import { resolveAssetUrl } from '../../utils/assetUrl';
import {
  X,
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';

interface LiveProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const LiveProjectModal: React.FC<LiveProjectModalProps> = ({ project, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [project?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  // Build full gallery array with cover as first image
  const allImages = Array.from(
    new Set([project.imageUrl, ...(project.galleryImages || [])].filter((img): img is string => Boolean(img && img.trim())))
  );

  const currentImage = allImages[activeImageIndex] || project.imageUrl;

  const isValidUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed === '#' || trimmed.length < 5) return false;
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-[#0d1117] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#090b10]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-0.5">
                <span>{project.category}</span>
                {project.projectScope && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{project.projectScope}</span>
                  </>
                )}
                {project.developmentMethod && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400">
                      {project.developmentMethod}
                      {project.dragAndDropBuilder ? ` (${project.dragAndDropBuilder})` : ''}
                    </span>
                  </>
                )}
              </div>
              <h3 id="modal-project-title" className="text-base sm:text-lg font-bold text-white truncate">
                {project.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isValidUrl(project.liveUrl) && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Main Visual Showcase / Gallery Frame */}
          <div className="space-y-3">
            <div className="relative w-full aspect-video sm:h-[420px] rounded-2xl overflow-hidden bg-[#07090e] border border-white/10 flex items-center justify-center group shadow-inner">
              {currentImage ? (
                <img
                  src={resolveAssetUrl(currentImage)}
                  alt={project.title}
                  className="w-full h-full object-contain sm:object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600">
                  <FolderGit2 className="w-12 h-12 mb-2" />
                  <span className="text-xs">No preview image</span>
                </div>
              )}

              {/* Prev / Next Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Counter Badge */}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-mono text-white border border-white/10">
                    {activeImageIndex + 1} / {allImages.length}
                  </span>
                </>
              )}

              {/* Highlight Badge */}
              {project.metricsOrHighlight && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-sky-500/90 text-slate-950 font-bold text-xs shadow-md">
                  {project.metricsOrHighlight}
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-sky-400 ring-2 ring-sky-400/50 scale-102'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveAssetUrl(img)} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details Narrative */}
          <div className="space-y-4 pt-2">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">
                Project Overview & Case Study
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {project.fullDescription || project.shortDescription}
              </p>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Category */}
              <div className="p-3.5 rounded-xl bg-[#161c26] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 block">Category</span>
                <span className="text-xs font-semibold text-white">{project.category}</span>
              </div>

              {/* Scope */}
              <div className="p-3.5 rounded-xl bg-[#161c26] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 block">Scope / Type</span>
                <span className="text-xs font-semibold text-white">{project.projectScope || 'Full Stack'}</span>
              </div>

              {/* Method */}
              <div className="p-3.5 rounded-xl bg-[#161c26] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 block">Development Method</span>
                <span className="text-xs font-semibold text-white">
                  {project.developmentMethod || 'Custom Code'}
                  {project.dragAndDropBuilder ? ` (${project.dragAndDropBuilder})` : ''}
                </span>
              </div>

              {/* Client or Status */}
              <div className="p-3.5 rounded-xl bg-[#161c26] border border-white/5 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 block">Client / Status</span>
                <span className="text-xs font-semibold text-white">
                  {project.clientName || project.projectStatus || 'Completed'}
                </span>
              </div>
            </div>

            {/* Technologies Used */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                Technologies & Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(project.technologies || []).map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-xs font-mono text-slate-300 bg-white/[0.04] rounded-lg border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Services / Disciplines Delivered */}
            {project.servicesPerformed && project.servicesPerformed.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                  Services Delivered
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.servicesPerformed.map((srv) => (
                    <span
                      key={srv}
                      className="px-2.5 py-1 text-xs font-medium text-sky-300 bg-sky-500/10 rounded-lg border border-sky-400/20 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-sky-400" />
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Skills */}
            {project.skillsUsed && project.skillsUsed.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                  Related Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.skillsUsed.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-white/[0.02] rounded-md border border-white/5"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#090b10] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
            )}

            {project.caseStudyUrl && (
              <a
                href={project.caseStudyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>External Case Study</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isValidUrl(project.liveUrl) && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                <span>Launch Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
