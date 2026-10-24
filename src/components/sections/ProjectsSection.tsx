import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ProjectItem } from '../../types/portfolio';
import { resolveElementStyles } from '../../utils/styleResolver';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { LiveProjectModal } from './LiveProjectModal';
import { ExternalLink, Eye, ArrowUpRight, Github, FolderGit2, Sparkles } from 'lucide-react';

// Interactive Project Preview Component with Full Website Auto-Scroll
interface ProjectCardPreviewProps {
  project: ProjectItem;
  onOpenModal: () => void;
  canSelectInStudio: boolean;
}

const ProjectCardPreview: React.FC<ProjectCardPreviewProps> = ({
  project,
  onOpenModal,
  canSelectInStudio
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileScrolling, setIsMobileScrolling] = useState(false);
  const [imageRatio, setImageRatio] = useState<number>(1.6);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 380,
    height: 270
  });

  const initialPreviewUrl = resolveAssetUrl(
    project.fullWebsitePreviewUrl && project.fullWebsitePreviewUrl.trim()
      ? project.fullWebsitePreviewUrl.trim()
      : project.imageUrl?.trim() || ''
  );

  const [imgSrc, setImgSrc] = useState(initialPreviewUrl);
  const [hasBothFailed, setHasBothFailed] = useState(false);

  React.useEffect(() => {
    setImgSrc(initialPreviewUrl);
    setHasBothFailed(false);
    setIframeFailed(false);
    setIframeLoaded(false);
  }, [initialPreviewUrl, project.liveUrl]);

  React.useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 380,
          height: containerRef.current.clientHeight || 270
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0) {
      setImageRatio(img.naturalHeight / img.naturalWidth);
    }
  };

  const isScrolling = isHovered || isMobileScrolling;

  // Iframe embedding configuration
  const TARGET_DESKTOP_WIDTH = 1200;
  const TARGET_PAGE_HEIGHT = 3600;
  const scale = dimensions.width > 0 ? dimensions.width / TARGET_DESKTOP_WIDTH : 0.32;
  const scaledIframeHeight = TARGET_PAGE_HEIGHT * scale;
  const viewportHeight = Math.max(180, dimensions.height - 28);

  // Maximum scroll distance
  const iframeMaxScroll = Math.max(0, scaledIframeHeight - viewportHeight);
  const imageCalculatedHeight = dimensions.width * (imageRatio || 1.6);
  const imageMaxScroll = Math.max(0, imageCalculatedHeight - viewportHeight);

  // Faran Traders uses CSP frame-ancestors blocking, so previewEmbedAllowed is false.
  // Others: DXB, Wajid, PDF Aura, Bakers Bite, TechSamaj PK allow embedding.
  const isEmbedSupported = project.previewEmbedAllowed !== false && !!project.liveUrl && !iframeFailed;
  const useLiveIframe = isEmbedSupported;

  // Scroll duration: 18s provides a slow, steady reading pace through all sections
  const scrollDurationSec = isEmbedSupported ? 18 : Math.min(18, Math.max(8, imageRatio * 4));

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={(e) => {
        if (!canSelectInStudio) {
          onOpenModal();
        }
      }}
      className="relative w-full h-64 sm:h-72 overflow-hidden bg-[#080b11] select-none group/preview cursor-pointer"
    >
      {/* Visual Browser Chrome Header */}
      <div className="absolute top-0 left-0 right-0 z-30 px-3 py-1.5 bg-[#090b10]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-2">
          {useLiveIframe ? (
            <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Website Auto-Scroll</span>
            </span>
          ) : (
            <span className="text-[9px] text-sky-400 font-medium tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Protected (CSP) · Full Preview</span>
            </span>
          )}
          {project.liveUrl && (
            <span className="text-[9px] text-amber-400/90 font-mono hidden sm:inline">
              ↗
            </span>
          )}
        </div>
      </div>

      {/* Viewport container starting below chrome header */}
      <div className="absolute top-7 inset-x-0 bottom-0 overflow-hidden bg-slate-950">
        {useLiveIframe ? (
          /* Live Website Auto-Scrolling Track */
          <div
            style={{
              transform: isScrolling ? `translateY(-${iframeMaxScroll}px)` : 'translateY(0px)',
              transition: isScrolling
                ? `transform ${scrollDurationSec}s linear`
                : 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform'
            }}
            className="w-full relative"
          >
            {/* Underlying fallback image so there is zero flicker while iframe initializes */}
            {(!iframeLoaded || !imgSrc) && imgSrc && (
              <img
                src={imgSrc}
                alt={project.title}
                className="w-full object-cover object-top absolute inset-0"
              />
            )}
            <div
              style={{
                width: TARGET_DESKTOP_WIDTH,
                height: TARGET_PAGE_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none'
              }}
              className="bg-white overflow-hidden"
            >
              <iframe
                src={project.liveUrl}
                title={`Live website preview of ${project.title}`}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeFailed(true)}
                style={{
                  width: `${TARGET_DESKTOP_WIDTH}px`,
                  height: `${TARGET_PAGE_HEIGHT}px`,
                  border: 0
                }}
                className="w-full h-full border-0 pointer-events-none"
              />
            </div>
          </div>
        ) : imgSrc && !hasBothFailed ? (
          /* High-Resolution Screenshot Auto-Scrolling Track (for CSP protected sites) */
          <div
            style={{
              transform: isScrolling ? `translateY(-${imageMaxScroll}px)` : 'translateY(0px)',
              transition: isScrolling
                ? `transform ${scrollDurationSec}s linear`
                : 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform'
            }}
            className="w-full relative"
          >
            <img
              src={imgSrc}
              alt={project.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              className="w-full object-cover object-top will-change-transform"
              onError={() => {
                const resolvedFallback = resolveAssetUrl(project.imageUrl);
                if (project.imageUrl && imgSrc !== resolvedFallback) {
                  setImgSrc(resolvedFallback);
                } else {
                  setHasBothFailed(true);
                }
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0a0d14] text-center space-y-3">
            <FolderGit2 className="w-10 h-10 text-slate-500" />
            <div className="text-xs font-mono text-slate-400 font-semibold">{project.title}</div>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold hover:bg-sky-500 hover:text-slate-950 transition-colors"
              >
                <span>Open Live Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Gentle Contrast Scrim */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-[#0f131a] via-black/15 to-transparent transition-opacity duration-300 pointer-events-none ${
          isScrolling ? 'opacity-20' : 'opacity-60 group-hover/preview:opacity-30'
        }`}
      />

      {/* Highlight Tag */}
      {project.metricsOrHighlight && (
        <div className="absolute right-3 top-8 text-[10px] font-mono font-medium text-sky-300 bg-[#090b10]/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10 shadow-sm z-30 pointer-events-none">
          {project.metricsOrHighlight}
        </div>
      )}

      {/* Touchscreen Tap-to-Scroll Control for Mobile & Tablet */}
      <div className="sm:hidden absolute bottom-2.5 right-2.5 z-30">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileScrolling(!isMobileScrolling);
          }}
          className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold font-mono shadow-md flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span>{isMobileScrolling ? 'Reset Top' : 'Scroll Website ↓'}</span>
        </button>
      </div>

      {/* Desktop Hover Cue Indicator */}
      {!isScrolling && (
        <div className="hidden sm:flex absolute bottom-2.5 left-3 z-30 items-center gap-1 text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded border border-white/15 opacity-80 group-hover/preview:opacity-100 transition-opacity pointer-events-none shadow-sm">
          <span>Hover to auto-scroll full page ↓</span>
        </div>
      )}
    </div>
  );
};

export const ProjectsSection: React.FC = () => {
  const {
    data,
    isStudioRoute,
    isStudioPreviewMode,
    studioViewport,
    selectedElement,
    setSelectedElement
  } = usePortfolio();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  // Dynamic categories from portfolio data
  const categories = useMemo(() => {
    const list = ['All'];
    const seen = new Set<string>();
    (data.projects || []).forEach((p) => {
      if (p.isVisible && p.category && !seen.has(p.category)) {
        seen.add(p.category);
        list.push(p.category);
      }
    });
    return list;
  }, [data.projects]);

  const visibleProjects = (data.projects || [])
    .filter((proj) => proj.isVisible)
    .filter((proj) => selectedCategory === 'All' || proj.category === selectedCategory)
    .sort((a, b) => a.order - b.order);

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;

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

  return (
    <section id="projects" className="py-24 relative border-t border-white/[0.06] bg-[#07090e]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs sm:text-sm font-mono text-amber-400 mb-3 uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Selected Works & Case Studies</span>
            </div>
            <h2 className="section-major-heading">
              Featured projects & client solutions.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3 font-normal leading-relaxed">
              Representative creations spanning web applications, custom digital builders, UI/UX systems, and high-performance engineering.
            </p>
          </div>

          {/* Category Filter Buttons */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#121620] border border-white/[0.08] rounded-xl self-start md:self-auto">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects Responsive Grid (Strict: 3 on Desktop, 2 on Tablet, 1 on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleProjects.map((project) => {
            const isSelected = selectedElement?.id === project.id;
            const projectCustomStyles = resolveElementStyles(project.style, studioViewport);
            const hasValidLiveUrl = isValidUrl(project.liveUrl);

            return (
              <div
                key={project.id}
                onClick={(e) => {
                  if (canSelectInStudio) {
                    e.stopPropagation();
                    setSelectedElement({
                      type: 'project',
                      id: project.id,
                      label: `Project: ${project.title}`,
                      sublabel: project.category,
                      breadcrumbs: [
                        { id: 'home', label: 'Home', type: 'section' },
                        { id: 'sec-projects', label: 'Projects', type: 'section' },
                        { id: project.id, label: project.title, type: 'project' }
                      ]
                    });
                  }
                }}
                style={projectCustomStyles}
                className={`group rounded-2xl border border-white/[0.08] bg-[#0f131a] hover:border-amber-400/40 hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.08),0_12px_24px_-8px_rgba(0,0,0,0.8)] hover:-translate-y-2 transition-all duration-400 overflow-hidden flex flex-col justify-between relative ${
                  canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
                } ${
                  isSelected && canSelectInStudio
                    ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] z-20'
                    : ''
                }`}
              >
                {/* Subtle Top Accent Hairline on Hover */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/80 transition-all duration-500 z-30" />

                {/* Floating Selection Tag for Studio Editor */}
                {isSelected && canSelectInStudio && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-sky-500 text-slate-950 font-mono text-[9px] font-bold z-30 shadow-lg">
                    Project Card
                  </span>
                )}

                {/* Interactive Media Container with Full Website Preview Vertical Scroll */}
                <ProjectCardPreview
                  project={project}
                  onOpenModal={() => setActiveModalProject(project)}
                  canSelectInStudio={canSelectInStudio}
                />

                {/* Content Box */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Technologies */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5 font-mono">
                      <span className="text-amber-400 font-semibold">{project.category}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400 truncate">
                        {(project.technologies || []).slice(0, 3).join(', ')}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors leading-snug font-heading">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5 line-clamp-2">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Card Action Links & Buttons */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    {/* VIEW PROJECT (Always visible) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalProject(project);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] group-hover:bg-amber-400/15 group-hover:border-amber-400/30 group-hover:text-amber-200 text-xs font-semibold text-slate-300 transition-all cursor-pointer border border-white/5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Project</span>
                    </button>

                    {/* Right: Live Demo (Only if valid URL) & GitHub */}
                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          title="View Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}

                      {/* LIVE DEMO (Only rendered if a valid URL exists) */}
                      {hasValidLiveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-white transition-colors text-xs font-semibold border border-sky-400/25 cursor-pointer"
                          title={`Open ${project.title} Live Website`}
                        >
                          <span>Open Live Website</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Project Details Modal */}
      {activeModalProject && (
        <LiveProjectModal
          project={activeModalProject}
          onClose={() => setActiveModalProject(null)}
        />
      )}
    </section>
  );
};
