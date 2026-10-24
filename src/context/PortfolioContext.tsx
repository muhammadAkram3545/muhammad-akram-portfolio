import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  PortfolioData,
  ViewMode,
  ThemePreset,
  IntroDisplayMode,
  SelectedElement,
  StudioViewport,
  SectionConfig,
  SectionType,
  ProjectItem,
  SkillItem,
  ServiceItem,
  ExperienceItem,
  NavigationItem,
  MediaItem,
  MediaType,
  MediaUsageRef,
  StudioAuthState,
  ElementStyleConfig,
  CanvasElement,
  ClipboardItem
} from '../types/portfolio';
import { initialPortfolioData } from '../data/initialPortfolioData';
import { portfolioService } from '../services/portfolioService';
import { resolveAssetUrl } from '../utils/assetUrl';
import { authService } from '../services/authService';
import { versionService } from '../services/versionService';
import { VersionHistoryItem } from '../types/backend';

export type AutosaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface HistoryState {
  past: PortfolioData[];
  present: PortfolioData;
  future: PortfolioData[];
}

interface PortfolioContextType {
  // Data States
  data: PortfolioData; // Active data (draft in studio/preview, published in public)
  draftData: PortfolioData;
  publishedData: PortfolioData;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Data Updates & History
  updateDraft: (updater: (prev: PortfolioData) => PortfolioData, trackHistory?: boolean) => void;
  updateData: (updater: (prev: PortfolioData) => PortfolioData, trackHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autosaveStatus: AutosaveStatus;
  saveDraftManual: () => void;
  publishDraft: (releaseNotes?: string) => Promise<boolean> | void;
  discardDraft: () => void;
  resetToDefaults: () => void;
  versionHistory: VersionHistoryItem[];
  restoreVersion: (id: string) => Promise<boolean>;
  networkStatus: 'online' | 'offline';

  // Studio Mode & Selection
  isStudioRoute: boolean;
  setIsStudioRoute: (isStudio: boolean) => void;
  isStudioPreviewMode: boolean;
  setIsStudioPreviewMode: (preview: boolean) => void;
  studioViewport: StudioViewport;
  setStudioViewport: (viewport: StudioViewport) => void;
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  selectParentElement: () => void;

  // Canvas View Controls
  canvasZoom: number;
  setCanvasZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean) => void;

  // Clipboard & Copy / Paste
  clipboard: ClipboardItem | null;
  copySelected: () => void;
  pasteClipboard: (targetSectionId?: string) => void;
  copiedStyle: ElementStyleConfig | null;
  copyElementStyle: (elementId: string) => void;
  pasteElementStyle: (elementId: string) => void;
  getElementStyle: (elementId: string) => ElementStyleConfig | undefined;

  // Section Operations
  reorderSections: (sourceIndex: number, destIndex: number) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  toggleSectionVisibility: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  deleteSection: (sectionId: string) => void;
  addSection: (type: SectionType, title?: string) => void;
  updateSectionConfig: (sectionId: string, updates: Partial<SectionConfig>) => void;
  updateSectionStyle: (sectionId: string, styleUpdates: Partial<ElementStyleConfig>) => void;

  // Advanced Canvas Element Operations
  insertCanvasElement: (sectionId: string, elementType: CanvasElement['type'], insertIndex?: number) => CanvasElement;
  updateCanvasElement: (sectionId: string, elementId: string, updates: Partial<CanvasElement>) => void;
  deleteCanvasElement: (sectionId: string, elementId: string) => void;
  moveCanvasElement: (sectionId: string, elementId: string, direction: 'up' | 'down') => void;
  updateElementStyle: (elementId: string, styleUpdates: Partial<ElementStyleConfig>, isResponsive?: boolean) => void;
  resetElementStyle: (elementId: string) => void;
  resetResponsiveOverride: (elementId: string, viewport: 'tablet' | 'mobile') => void;

  // Entity Management Helpers
  addProject: (project?: Partial<ProjectItem>) => void;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  reorderProjects: (sourceIndex: number, destIndex: number) => void;

  addSkill: (skill?: Partial<SkillItem>) => void;
  updateSkill: (id: string, updates: Partial<SkillItem>) => void;
  deleteSkill: (id: string) => void;
  duplicateSkill: (id: string) => void;

  addService: (service?: Partial<ServiceItem>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  duplicateService: (id: string) => void;

  addExperience: (exp?: Partial<ExperienceItem>) => void;
  updateExperience: (id: string, updates: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  duplicateExperience: (id: string) => void;

  addNavItem: (item?: Partial<NavigationItem>) => void;
  updateNavItem: (id: string, updates: Partial<NavigationItem>) => void;
  deleteNavItem: (id: string) => void;

  // Media Library Operations
  addMediaItem: (item: Partial<MediaItem> & { url: string; name: string }) => MediaItem;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  safeDeleteMedia: (id: string, force?: boolean) => { success: boolean; usageCount: number; references: MediaUsageRef[] };
  replaceMedia: (oldMediaId: string, newMediaData: Partial<MediaItem>) => void;
  getMediaUsage: (mediaIdOrUrl: string) => MediaUsageRef[];
  markMediaBroken: (mediaId: string, isBroken: boolean) => void;

  // Media Picker Dialog State
  isMediaPickerOpen: boolean;
  mediaPickerFilter: MediaType | 'all';
  openMediaPicker: (onSelect: (media: MediaItem) => void, filterType?: MediaType | 'all') => void;
  closeMediaPicker: () => void;
  confirmMediaPickerSelect: (media: MediaItem) => void;

  // Project Gallery Operations
  addProjectGalleryImage: (projectId: string, imageUrl: string) => void;
  removeProjectGalleryImage: (projectId: string, imageIndex: number) => void;
  reorderProjectGallery: (projectId: string, sourceIndex: number, destIndex: number) => void;
  setProjectMainImage: (projectId: string, imageUrl: string) => void;

  // Authentication
  auth: StudioAuthState;
  loginStudio: (passkey: string, email?: string) => Promise<boolean> | boolean;
  logoutStudio: () => Promise<void> | void;

  // Preserved from Prompt 1 & 2
  isIntroActive: boolean;
  setIsIntroActive: (active: boolean) => void;
  replayIntro: () => void;
  skipIntro: () => void;
  setIntroMode: (mode: IntroDisplayMode) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  exportConfigJson: () => string;
  importConfigJson: (json: string) => boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  currentThemePreset: ThemePreset;
  toggleTheme: () => void;
  setThemePreset: (preset: ThemePreset) => void;
}

const STORAGE_PUBLISHED_KEY = 'ma_portfolio_published_v3';
const STORAGE_DRAFT_KEY = 'ma_portfolio_draft_v3';
const STORAGE_AUTH_KEY = 'ma_studio_auth_session';
const INTRO_SEEN_KEY = 'ma_intro_seen';

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Helper to ensure section data integrity & seamless version migration
function normalizePortfolio(raw: any): PortfolioData {
  const merged: PortfolioData = {
    ...initialPortfolioData,
    ...raw,
    schemaVersion: 3,
    personal: {
      ...initialPortfolioData.personal,
      ...(raw?.personal || {})
    }
  };

  // Guarantee the 5 canonical projects are always present without duplication
  const canonicalProjects = initialPortfolioData.projects || [];
  const currentProjects: ProjectItem[] = Array.isArray(raw?.projects) ? raw.projects : [];

  // Filter out legacy dummy projects and placeholders
  const nonLegacy = currentProjects.filter(
    (p) =>
      p &&
      !p.liveUrl?.includes('example.com') &&
      p.id !== 'proj-nexus-saas' &&
      p.id !== 'proj-minimal-brand-3d' &&
      p.id !== 'proj-cinematic-motion' &&
      p.id !== 'proj-saas-platform' &&
      p.id !== 'proj-brand-identity' &&
      p.id !== 'proj-luxury-ecommerce' &&
      p.id !== 'proj-canvas-simulation' &&
      !p.title?.toLowerCase().includes('sleek analytics') &&
      !p.title?.toLowerCase().includes('geometric 3d') &&
      !p.title?.toLowerCase().includes('ultra-minimalist') &&
      !p.title?.toLowerCase().includes('interactive canvas')
  );

  const mergedProjects: ProjectItem[] = [...nonLegacy];

  canonicalProjects.forEach((canonicalProj) => {
    const existingIndex = mergedProjects.findIndex(
      (p) =>
        (p.liveUrl && canonicalProj.liveUrl && p.liveUrl.toLowerCase().trim() === canonicalProj.liveUrl.toLowerCase().trim()) ||
        (p.title && canonicalProj.title && p.title.toLowerCase().trim() === canonicalProj.title.toLowerCase().trim()) ||
        (canonicalProj.title.toLowerCase().includes('baker') && (p.title?.toLowerCase().includes('baker') || p.liveUrl?.includes('bakar'))) ||
        p.id === canonicalProj.id
    );

    if (existingIndex >= 0) {
      mergedProjects[existingIndex] = {
        ...canonicalProj,
        ...mergedProjects[existingIndex],
        imageUrl: canonicalProj.imageUrl || mergedProjects[existingIndex].imageUrl,
        fullWebsitePreviewUrl: canonicalProj.fullWebsitePreviewUrl || mergedProjects[existingIndex].fullWebsitePreviewUrl,
        hasFullPagePreview: canonicalProj.hasFullPagePreview !== undefined ? canonicalProj.hasFullPagePreview : mergedProjects[existingIndex].hasFullPagePreview,
        liveUrl: canonicalProj.liveUrl
      };
    } else {
      mergedProjects.push(canonicalProj);
    }
  });

  if (merged.personal) {
    if (merged.personal.avatarUrl) merged.personal.avatarUrl = resolveAssetUrl(merged.personal.avatarUrl);
    if (merged.personal.aboutImageUrl) merged.personal.aboutImageUrl = resolveAssetUrl(merged.personal.aboutImageUrl);
    if (merged.personal.heroBackgroundImageUrl) merged.personal.heroBackgroundImageUrl = resolveAssetUrl(merged.personal.heroBackgroundImageUrl);
    if (merged.personal.heroPortraitUrl) merged.personal.heroPortraitUrl = resolveAssetUrl(merged.personal.heroPortraitUrl);
  }

  merged.projects = mergedProjects.map((p) => ({
    ...p,
    imageUrl: resolveAssetUrl(p.imageUrl),
    fullWebsitePreviewUrl: resolveAssetUrl(p.fullWebsitePreviewUrl)
  })).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!merged.sections || merged.sections.length === 0) {
    merged.sections = initialPortfolioData.sections;
  } else {
    // Canonical section order guarantee:
    // NAVBAR -> HERO / HOME -> ABOUT -> EDUCATION -> SKILLS -> SERVICES -> PROJECTS -> EXPERIENCE -> CONTACT
    const weights: Record<string, number> = {
      hero: 1, home: 1, 'sec-hero': 1,
      about: 2, 'sec-about': 2,
      education: 3, 'sec-education': 3,
      skills: 4, 'sec-skills': 4,
      services: 5, 'sec-services': 5,
      projects: 6, 'sec-projects': 6,
      experience: 7, 'sec-experience': 7,
      contact: 8, 'sec-contact': 8
    };
    merged.sections = [...merged.sections].sort((a, b) => {
      const wa = weights[a.type?.toLowerCase() || ''] || weights[a.id?.toLowerCase() || ''] || (100 + (a.order || 0));
      const wb = weights[b.type?.toLowerCase() || ''] || weights[b.id?.toLowerCase() || ''] || (100 + (b.order || 0));
      return wa - wb;
    });
  }
  if (!merged.education) {
    merged.education = initialPortfolioData.education;
  }
  if (!merged.media || merged.media.length === 0) {
    merged.media = initialPortfolioData.media;
  }
  return merged;
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Published Version
  const [publishedData, setPublishedData] = useState<PortfolioData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PUBLISHED_KEY) || localStorage.getItem('ma_portfolio_published_v2');
      if (saved) return normalizePortfolio(JSON.parse(saved));
    } catch {}
    return normalizePortfolio(initialPortfolioData);
  });

  // Draft Version
  const [draftData, setDraftData] = useState<PortfolioData>(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_DRAFT_KEY) || localStorage.getItem('ma_portfolio_draft_v2');
      if (savedDraft) return normalizePortfolio(JSON.parse(savedDraft));
      const savedPub = localStorage.getItem(STORAGE_PUBLISHED_KEY) || localStorage.getItem('ma_portfolio_published_v2');
      if (savedPub) return normalizePortfolio(JSON.parse(savedPub));
    } catch {}
    return normalizePortfolio(initialPortfolioData);
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: draftData,
    future: []
  });

  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Studio route detection
  const [isStudioRoute, setIsStudioRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path.includes('/studio') ||
      path.includes('/admin') ||
      hash.includes('#studio') ||
      hash.includes('#admin')
    );
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isStudio =
        path.includes('/studio') ||
        path.includes('/admin') ||
        hash.includes('#studio') ||
        hash.includes('#admin');
      setIsStudioRoute(isStudio);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Studio States
  const [isStudioPreviewMode, setIsStudioPreviewMode] = useState<boolean>(false);
  const [studioViewport, setStudioViewport] = useState<StudioViewport>('desktop');
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<ElementStyleConfig | null>(null);

  // Media Picker Dialog State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerFilter, setMediaPickerFilter] = useState<MediaType | 'all'>('all');
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((media: MediaItem) => void) | null>(null);

  // Authentication State
  const [auth, setAuth] = useState<StudioAuthState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated) return parsed;
      }
    } catch {}
    return { isAuthenticated: false, userEmail: '', role: 'editor' };
  });

  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [, setSessionExpired] = useState(false);

  // Initial Load from Persistent Backend
  useEffect(() => {
    // 1. Fetch published portfolio for visitors
    portfolioService
      .getPublishedPortfolio()
      .then((pub) => {
        if (pub && pub.sections && pub.sections.length > 0) {
          setPublishedData(normalizePortfolio(pub));
        }
      })
      .catch((err) => {
        console.warn('[Context] Using cached published portfolio:', err);
      });

    // 2. Validate current session with backend
    authService
      .checkSession()
      .then(async (session) => {
        if (session.authenticated && session.user) {
          const activeAuth: StudioAuthState = {
            isAuthenticated: true,
            userEmail: session.user.email,
            role: session.user.role === 'super_admin' ? 'super_admin' : 'editor'
          };
          setAuth(activeAuth);
          try {
            localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(activeAuth));
          } catch {}

          // Load server draft & version history
          try {
            const serverDraft = await portfolioService.getDraft();
            if (serverDraft && serverDraft.sections) {
              setDraftData(normalizePortfolio(serverDraft));
            }
            const versions = await versionService.listVersions();
            setVersionHistory(versions as any);
          } catch (e) {
            console.warn('[Context] Could not load draft from server:', e);
          }
        } else {
          setAuth({ isAuthenticated: false, userEmail: '', role: 'editor' });
          try {
            localStorage.removeItem(STORAGE_AUTH_KEY);
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Online/offline connection handling
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Session expired broadcast handler
    const handleSessionExpired = () => {
      setSessionExpired(true);
      setAuth({ isAuthenticated: false, userEmail: '', role: 'editor' });
      try {
        localStorage.removeItem(STORAGE_AUTH_KEY);
      } catch {}
    };
    window.addEventListener('studio-session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('studio-session-expired', handleSessionExpired);
    };
  }, []);

  const loginStudio = useCallback(async (passkey: string, email: string = 'admin@muhammadakram.dev'): Promise<boolean> => {
    try {
      const res = await authService.login(passkey, email);
      if (res.success && res.user) {
        const newAuth: StudioAuthState = {
          isAuthenticated: true,
          userEmail: res.user.email,
          role: res.user.role === 'super_admin' ? 'super_admin' : 'editor'
        };
        setAuth(newAuth);
        try {
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(newAuth));
        } catch {}

        // Load server draft & version history
        try {
          const serverDraft = await portfolioService.getDraft();
          if (serverDraft && serverDraft.sections) {
            setDraftData(normalizePortfolio(serverDraft));
          }
          const versions = await versionService.listVersions();
          setVersionHistory(versions as any);
        } catch (e) {
          console.warn('[Context] Could not load draft after login:', e);
        }
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }, []);

  const logoutStudio = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    const cleared: StudioAuthState = { isAuthenticated: false, userEmail: '', role: 'editor' };
    setAuth(cleared);
    try {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    } catch {}
  }, []);

  const restoreVersion = useCallback(async (versionId: string): Promise<boolean> => {
    try {
      const res = await versionService.restoreVersion(versionId);
      if (res.success && res.restoredDraft) {
        const normalized = normalizePortfolio(res.restoredDraft);
        setDraftData(normalized);
        setHistory((h) => ({
          past: [...h.past.slice(-25), h.present],
          present: normalized,
          future: []
        }));
        try {
          localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(normalized));
        } catch {}
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Version] Error restoring version:', err);
      return false;
    }
  }, []);

  // Prompt 1 states
  const [viewMode, setViewMode] = useState<ViewMode>('published');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  // Active data
  const activeData = isStudioRoute || viewMode === 'draft' ? draftData : publishedData;

  // Intro logic
  const [isIntroActive, setIsIntroActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    if (isStudioRoute) return false;
    const mode = publishedData.intro.mode;
    if (mode === 'disabled' || mode === 'on_request') return false;
    if (mode === 'always') return true;
    try {
      return !localStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      return false;
    }
  });

  // Theme Preset Management with instant visual sync and local persistence
  const [activeThemePreset, setActiveThemePreset] = useState<ThemePreset>(() => {
    try {
      const saved = localStorage.getItem('ma_active_theme_preset') as ThemePreset;
      if (saved && ['obsidian', 'titanium', 'amber-gold', 'emerald', 'minimal-light'].includes(saved)) {
        return saved;
      }
    } catch {}
    return (draftData.theme?.preset as ThemePreset) || (publishedData.theme?.preset as ThemePreset) || 'obsidian';
  });

  const setThemePreset = useCallback((preset: ThemePreset) => {
    setActiveThemePreset(preset);
    try {
      localStorage.setItem('ma_active_theme_preset', preset);
    } catch {}
    // Update document immediately
    const root = document.documentElement;
    root.setAttribute('data-theme', preset);
    if (preset === 'minimal-light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    // Also update draft/published state
    setDraftData((prev) => ({
      ...prev,
      theme: { ...prev.theme, preset }
    }));
    setPublishedData((prev) => ({
      ...prev,
      theme: { ...prev.theme, preset }
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemePreset = activeThemePreset === 'minimal-light' ? 'obsidian' : 'minimal-light';
    setThemePreset(next);
  }, [activeThemePreset, setThemePreset]);

  // Apply Theme CSS variables & tokens to document root
  useEffect(() => {
    const root = document.documentElement;
    const current = activeThemePreset || 'obsidian';
    root.setAttribute('data-theme', current);
    if (current === 'minimal-light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [activeThemePreset]);

  // Autosave Draft with debounce and persistent backend sync
  const triggerAutosave = useCallback((updated: PortfolioData) => {
    setAutosaveStatus('unsaved');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      // Local safety cache
      try {
        localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(updated));
      } catch {}

      // Server persistence
      try {
        await portfolioService.saveDraft(updated);
        setAutosaveStatus('saved');
        setNetworkStatus('online');
      } catch (err) {
        console.warn('[Autosave] Server offline, state cached in browser storage:', err);
        setAutosaveStatus('unsaved');
        setNetworkStatus('offline');
      }
    }, 700);
  }, []);

  // Update Draft with History Tracking
  const updateDraft = useCallback(
    (updater: (prev: PortfolioData) => PortfolioData, trackHistory: boolean = true) => {
      setDraftData((prev) => {
        const next = updater(prev);
        next.lastUpdated = new Date().toISOString();

        if (trackHistory) {
          setHistory((h) => ({
            past: [...h.past.slice(-25), prev],
            present: next,
            future: []
          }));
        }

        triggerAutosave(next);
        return next;
      });
    },
    [triggerAutosave]
  );

  // Undo / Redo
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;
    setHistory((h) => {
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, h.past.length - 1);
      setDraftData(previous);
      triggerAutosave(previous);
      return {
        past: newPast,
        present: previous,
        future: [h.present, ...h.future]
      };
    });
  }, [canUndo, triggerAutosave]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setHistory((h) => {
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      setDraftData(next);
      triggerAutosave(next);
      return {
        past: [...h.past, h.present],
        present: next,
        future: newFuture
      };
    });
  }, [canRedo, triggerAutosave]);

  // Publish Draft with backend release archiving & validation
  const publishDraft = useCallback(async (releaseNotes?: string): Promise<boolean> => {
    try {
      const res = await portfolioService.publish(draftData, releaseNotes);
      if (res && res.success) {
        const normalized = normalizePortfolio(res.published);
        setPublishedData(normalized);
        setDraftData(normalized);
        try {
          localStorage.setItem(STORAGE_PUBLISHED_KEY, JSON.stringify(normalized));
          localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(normalized));
        } catch {}
        setAutosaveStatus('saved');
        const versions = await versionService.listVersions();
        setVersionHistory(versions as any);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('[Publish] Backend publish failed:', err);
      setAutosaveStatus('error');
      // Do not return true or display success when backend rejected or failed publish
      return false;
    }
  }, [draftData]);

  // Save Draft Manually
  const saveDraftManual = useCallback(async () => {
    setAutosaveStatus('saving');
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draftData));
    } catch {}

    try {
      await portfolioService.saveDraft(draftData);
      setAutosaveStatus('saved');
      setNetworkStatus('online');
    } catch {
      setAutosaveStatus('unsaved');
      setNetworkStatus('offline');
    }
  }, [draftData]);

  // Discard Draft
  const discardDraft = useCallback(() => {
    setDraftData(publishedData);
    setHistory({ past: [], present: publishedData, future: [] });
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(publishedData));
    } catch {}
    setAutosaveStatus('saved');
  }, [publishedData]);

  // Reset to Clean Defaults
  const resetToDefaults = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_PUBLISHED_KEY);
      localStorage.removeItem(STORAGE_DRAFT_KEY);
    } catch {}
    setPublishedData(initialPortfolioData);
    setDraftData(initialPortfolioData);
    setHistory({ past: [], present: initialPortfolioData, future: [] });
    setAutosaveStatus('saved');
  }, []);

  // Canvas Zoom Helpers
  const zoomIn = useCallback(() => setCanvasZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10)), []);
  const zoomOut = useCallback(() => setCanvasZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10)), []);
  const resetZoom = useCallback(() => setCanvasZoom(1.0), []);

  // Selection Parent Navigation
  const selectParentElement = useCallback(() => {
    if (!selectedElement) return;
    if (selectedElement.parentId) {
      // Find parent in sections
      const parentSection = draftData.sections.find((s) => s.id === selectedElement.parentId);
      if (parentSection) {
        setSelectedElement({
          type: 'section',
          id: parentSection.id,
          label: parentSection.title,
          sublabel: parentSection.internalId,
          breadcrumbs: [
            { id: 'page-home', label: 'Home', type: 'section' },
            { id: parentSection.id, label: parentSection.title, type: 'section' }
          ]
        });
        return;
      }
    }
    // Deselect if at root
    setSelectedElement(null);
  }, [selectedElement, draftData.sections]);

  // ==========================================
  // Copy / Paste Architecture
  // ==========================================
  const copySelected = useCallback(() => {
    if (!selectedElement) return;
    if (selectedElement.type === 'section') {
      const sec = draftData.sections.find((s) => s.id === selectedElement.id);
      if (sec) {
        setClipboard({ type: 'section', data: JSON.parse(JSON.stringify(sec)) });
      }
    } else if (selectedElement.type === 'project') {
      const proj = draftData.projects.find((p) => p.id === selectedElement.id);
      if (proj) {
        setClipboard({ type: 'element', data: JSON.parse(JSON.stringify(proj)) });
      }
    } else if (selectedElement.type === 'skill') {
      const sk = draftData.skills.find((s) => s.id === selectedElement.id);
      if (sk) {
        setClipboard({ type: 'element', data: JSON.parse(JSON.stringify(sk)) });
      }
    } else if (selectedElement.type === 'service') {
      const srv = draftData.services.find((s) => s.id === selectedElement.id);
      if (srv) {
        setClipboard({ type: 'element', data: JSON.parse(JSON.stringify(srv)) });
      }
    }
  }, [selectedElement, draftData]);

  const pasteClipboard = useCallback((targetSectionId?: string) => {
    if (!clipboard) return;
    if (clipboard.type === 'section') {
      updateDraft((prev) => {
        const clonedSection: SectionConfig = {
          ...clipboard.data,
          id: `sec-${Date.now()}`,
          title: `${clipboard.data.title} (Pasted)`,
          internalId: `${clipboard.data.internalId}-copy-${Date.now().toString().slice(-4)}`,
          order: prev.sections.length + 1
        };
        return { ...prev, sections: [...prev.sections, clonedSection] };
      });
    } else if (clipboard.type === 'element') {
      // Element paste logic
      if (clipboard.data.category) {
        // Project or Skill
        if ('technologies' in clipboard.data) {
          updateDraft((prev) => ({
            ...prev,
            projects: [
              { ...clipboard.data, id: `proj-${Date.now()}`, title: `${clipboard.data.title} (Pasted)` },
              ...prev.projects
            ]
          }));
        } else if ('proficiencyPercentage' in clipboard.data) {
          updateDraft((prev) => ({
            ...prev,
            skills: [
              ...prev.skills,
              { ...clipboard.data, id: `skill-${Date.now()}`, name: `${clipboard.data.name} (Pasted)` }
            ]
          }));
        }
      }
    }
  }, [clipboard, updateDraft]);

  // ==========================================
  // Section Operations
  // ==========================================
  const reorderSections = useCallback((sourceIndex: number, destIndex: number) => {
    updateDraft((prev) => {
      const items = [...prev.sections];
      const [removed] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, removed);
      const reindexed = items.map((sec, idx) => ({ ...sec, order: idx + 1 }));
      return { ...prev, sections: reindexed };
    });
  }, [updateDraft]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    updateDraft((prev) => {
      const sorted = [...prev.sections].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const [current] = sorted.splice(index, 1);
      sorted.splice(targetIndex, 0, current);

      const updated = sorted.map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...prev, sections: updated };
    });
  }, [updateDraft]);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, isVisible: !sec.isVisible } : sec
      )
    }));
  }, [updateDraft]);

  const duplicateSection = useCallback((sectionId: string) => {
    updateDraft((prev) => {
      const target = prev.sections.find((s) => s.id === sectionId);
      if (!target) return prev;
      const newSec: SectionConfig = {
        ...target,
        id: `sec-${Date.now()}`,
        title: `${target.title} (Copy)`,
        internalId: `${target.internalId}-copy-${Date.now().toString().slice(-4)}`,
        order: target.order + 1
      };
      const newSections = [...prev.sections, newSec].map((s, idx) => ({
        ...s,
        order: idx + 1
      }));
      return { ...prev, sections: newSections };
    });
  }, [updateDraft]);

  const deleteSection = useCallback((sectionId: string) => {
    updateDraft((prev) => {
      if (prev.sections.length <= 1) return prev;
      const filtered = prev.sections
        .filter((s) => s.id !== sectionId)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...prev, sections: filtered };
    });
  }, [updateDraft]);

  const addSection = useCallback((type: SectionType, title?: string) => {
    updateDraft((prev) => {
      const defaultTitles: Record<SectionType, string> = {
        hero: 'Hero / Home',
        about: 'About The Creator',
        education: 'Education & Qualifications',
        skills: 'Skills & Proficiencies',
        services: 'Services & Deliverables',
        projects: 'Project Showcase',
        experience: 'Career Milestones',
        contact: 'Contact & Collaboration',
        custom: 'Custom Content Block'
      };

      const newSec: SectionConfig = {
        id: `sec-${Date.now()}`,
        type,
        title: title || defaultTitles[type] || 'New Section',
        internalId: `section-${Date.now().toString().slice(-4)}`,
        isVisible: true,
        order: prev.sections.length + 1,
        paddingTop: 'lg',
        paddingBottom: 'lg',
        customTitle: type === 'custom' ? 'Custom Section Title' : undefined,
        customContent: type === 'custom' ? 'Add rich customized content blocks here.' : undefined,
        elements: []
      };

      return { ...prev, sections: [...prev.sections, newSec] };
    });
  }, [updateDraft]);

  const updateSectionConfig = useCallback((sectionId: string, updates: Partial<SectionConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    }));
  }, [updateDraft]);

  const updateSectionStyle = useCallback((sectionId: string, styleUpdates: Partial<ElementStyleConfig>) => {
    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          style: {
            ...s.style,
            ...styleUpdates
          }
        };
      })
    }));
  }, [updateDraft]);

  // ==========================================
  // Advanced Canvas Element Operations
  // ==========================================
  const insertCanvasElement = useCallback((
    sectionId: string,
    elementType: CanvasElement['type'],
    insertIndex?: number
  ): CanvasElement => {
    const newElement: CanvasElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: elementType,
      parentId: sectionId,
      content: {
        text: elementType === 'heading' ? 'Custom Section Heading' : elementType === 'paragraph' ? 'Custom body paragraph text with styled typography and spacing.' : elementType === 'button' ? 'Action Button' : undefined,
        headingLevel: elementType === 'heading' ? 'h3' : undefined,
        url: elementType === 'button' ? '#contact' : undefined
      },
      style: {
        typography: {
          color: '#ffffff'
        },
        margin: { top: 8, right: 0, bottom: 8, left: 0, unit: 'px', isLinked: false },
        padding: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', isLinked: true }
      },
      order: 1
    };

    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const currentElements = sec.elements ? [...sec.elements] : [];
        if (typeof insertIndex === 'number' && insertIndex >= 0) {
          currentElements.splice(insertIndex, 0, newElement);
        } else {
          currentElements.push(newElement);
        }
        return {
          ...sec,
          elements: currentElements.map((el, i) => ({ ...el, order: i + 1 }))
        };
      })
    }));

    // Auto-select newly created element
    setSelectedElement({
      type: 'element',
      id: newElement.id,
      sectionId,
      parentId: sectionId,
      label: `${newElement.type.toUpperCase()}: ${newElement.content.text || newElement.type}`,
      breadcrumbs: [
        { id: 'home', label: 'Home', type: 'section' },
        { id: sectionId, label: 'Section', type: 'section' },
        { id: newElement.id, label: newElement.type, type: 'element' }
      ]
    });

    return newElement;
  }, [updateDraft]);

  const updateCanvasElement = useCallback((
    sectionId: string,
    elementId: string,
    updates: Partial<CanvasElement>
  ) => {
    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          elements: sec.elements?.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
        };
      })
    }));
  }, [updateDraft]);

  const deleteCanvasElement = useCallback((sectionId: string, elementId: string) => {
    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          elements: sec.elements?.filter((el) => el.id !== elementId)
        };
      })
    }));
    setSelectedElement(null);
  }, [updateDraft]);

  const moveCanvasElement = useCallback((
    sectionId: string,
    elementId: string,
    direction: 'up' | 'down'
  ) => {
    updateDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId || !sec.elements) return sec;
        const index = sec.elements.findIndex((e) => e.id === elementId);
        if (index === -1) return sec;
        if (direction === 'up' && index === 0) return sec;
        if (direction === 'down' && index === sec.elements.length - 1) return sec;

        const target = direction === 'up' ? index - 1 : index + 1;
        const items = [...sec.elements];
        const [moved] = items.splice(index, 1);
        items.splice(target, 0, moved);

        return {
          ...sec,
          elements: items.map((e, idx) => ({ ...e, order: idx + 1 }))
        };
      })
    }));
  }, [updateDraft]);

  // Style Clipboard & Style Retrieval
  const getElementStyle = useCallback((elementId: string): ElementStyleConfig | undefined => {
    // 1. Sections
    const sec = draftData.sections.find((s) => s.id === elementId);
    if (sec) return sec.style;

    // 2. Section Canvas Elements
    for (const s of draftData.sections) {
      const el = s.elements?.find((e) => e.id === elementId);
      if (el) return el.style;
    }

    // 3. Projects
    const proj = draftData.projects.find((p) => p.id === elementId);
    if (proj) return proj.style;

    // 4. Skills
    const sk = draftData.skills.find((s) => s.id === elementId);
    if (sk) return sk.style;

    // 5. Services
    const srv = draftData.services.find((s) => s.id === elementId);
    if (srv) return srv.style;

    // 6. Experience
    const exp = draftData.experience.find((e) => e.id === elementId);
    if (exp) return exp.style;

    // 7. Hero Elements
    if (elementId === 'hero-headline') return draftData.personal.headingStyle;
    if (elementId === 'hero-bio') return draftData.personal.bioStyle;
    if (elementId === 'hero-avatar') return draftData.personal.avatarStyle;

    return undefined;
  }, [draftData]);

  const copyElementStyle = useCallback((elementId: string) => {
    const style = getElementStyle(elementId);
    if (style) {
      setCopiedStyle(JSON.parse(JSON.stringify(style)));
    }
  }, [getElementStyle]);

  const pasteElementStyle = useCallback((elementId: string) => {
    if (copiedStyle) {
      updateElementStyle(elementId, copiedStyle);
    }
  }, [copiedStyle]);

  // Universal Element Style Updater (supports responsive overrides)
  const updateElementStyle = useCallback((
    elementId: string,
    styleUpdates: Partial<ElementStyleConfig>,
    isResponsiveOverride: boolean = false
  ) => {
    updateDraft((prev) => {
      const applyToStyle = (currentStyle?: ElementStyleConfig): ElementStyleConfig => {
        const base: ElementStyleConfig = { ...(currentStyle || {}) };
        if (isResponsiveOverride && studioViewport !== 'desktop') {
          const overrideKey = studioViewport === 'tablet' ? 'tabletOverrides' : 'mobileOverrides';
          base[overrideKey] = {
            ...base[overrideKey],
            ...(styleUpdates as any)
          };
        } else {
          Object.assign(base, styleUpdates);
        }
        return base;
      };

      // 1. Sections
      const secIndex = prev.sections.findIndex((s) => s.id === elementId);
      if (secIndex !== -1) {
        const targetSec = prev.sections[secIndex];
        const newSections = [...prev.sections];
        newSections[secIndex] = { ...targetSec, style: applyToStyle(targetSec.style) };
        return { ...prev, sections: newSections };
      }

      // 2. Canvas element inside any section
      for (let s = 0; s < prev.sections.length; s++) {
        const sec = prev.sections[s];
        if (sec.elements) {
          const elIndex = sec.elements.findIndex((e) => e.id === elementId);
          if (elIndex !== -1) {
            const targetEl = sec.elements[elIndex];
            const updatedElements = [...sec.elements];
            updatedElements[elIndex] = { ...targetEl, style: applyToStyle(targetEl.style) };
            const newSections = [...prev.sections];
            newSections[s] = { ...sec, elements: updatedElements };
            return { ...prev, sections: newSections };
          }
        }
      }

      // 3. Projects
      const projIndex = prev.projects.findIndex((p) => p.id === elementId);
      if (projIndex !== -1) {
        const targetProj = prev.projects[projIndex];
        const newProjects = [...prev.projects];
        newProjects[projIndex] = { ...targetProj, style: applyToStyle(targetProj.style) };
        return { ...prev, projects: newProjects };
      }

      // 4. Skills
      const skillIndex = prev.skills.findIndex((s) => s.id === elementId);
      if (skillIndex !== -1) {
        const targetSkill = prev.skills[skillIndex];
        const newSkills = [...prev.skills];
        newSkills[skillIndex] = { ...targetSkill, style: applyToStyle(targetSkill.style) };
        return { ...prev, skills: newSkills };
      }

      // 5. Services
      const srvIndex = prev.services.findIndex((s) => s.id === elementId);
      if (srvIndex !== -1) {
        const targetSrv = prev.services[srvIndex];
        const newServices = [...prev.services];
        newServices[srvIndex] = { ...targetSrv, style: applyToStyle(targetSrv.style) };
        return { ...prev, services: newServices };
      }

      // 6. Experience
      const expIndex = prev.experience.findIndex((e) => e.id === elementId);
      if (expIndex !== -1) {
        const targetExp = prev.experience[expIndex];
        const newExp = [...prev.experience];
        newExp[expIndex] = { ...targetExp, style: applyToStyle(targetExp.style) };
        return { ...prev, experience: newExp };
      }

      // 7. Hero Elements
      if (elementId === 'hero-headline') {
        return {
          ...prev,
          personal: {
            ...prev.personal,
            headingStyle: applyToStyle(prev.personal.headingStyle)
          }
        };
      }
      if (elementId === 'hero-bio') {
        return {
          ...prev,
          personal: {
            ...prev.personal,
            bioStyle: applyToStyle(prev.personal.bioStyle)
          }
        };
      }
      if (elementId === 'hero-avatar') {
        return {
          ...prev,
          personal: {
            ...prev.personal,
            avatarStyle: applyToStyle(prev.personal.avatarStyle)
          }
        };
      }

      return prev;
    });
  }, [studioViewport, updateDraft]);

  const resetElementStyle = useCallback((elementId: string) => {
    updateDraft((prev) => {
      // 1. Sections
      const secIndex = prev.sections.findIndex((s) => s.id === elementId);
      if (secIndex !== -1) {
        const newSections = [...prev.sections];
        newSections[secIndex] = { ...newSections[secIndex], style: undefined };
        return { ...prev, sections: newSections };
      }
      // 2. Elements in sections
      for (let s = 0; s < prev.sections.length; s++) {
        const sec = prev.sections[s];
        if (sec.elements) {
          const elIndex = sec.elements.findIndex((e) => e.id === elementId);
          if (elIndex !== -1) {
            const newElements = [...sec.elements];
            newElements[elIndex] = { ...newElements[elIndex], style: undefined };
            const newSections = [...prev.sections];
            newSections[s] = { ...sec, elements: newElements };
            return { ...prev, sections: newSections };
          }
        }
      }
      // 3. Projects
      const projIndex = prev.projects.findIndex((p) => p.id === elementId);
      if (projIndex !== -1) {
        const newProjects = [...prev.projects];
        newProjects[projIndex] = { ...newProjects[projIndex], style: undefined };
        return { ...prev, projects: newProjects };
      }
      // 4. Skills
      const skillIndex = prev.skills.findIndex((s) => s.id === elementId);
      if (skillIndex !== -1) {
        const newSkills = [...prev.skills];
        newSkills[skillIndex] = { ...newSkills[skillIndex], style: undefined };
        return { ...prev, skills: newSkills };
      }
      // 5. Services
      const srvIndex = prev.services.findIndex((s) => s.id === elementId);
      if (srvIndex !== -1) {
        const newServices = [...prev.services];
        newServices[srvIndex] = { ...newServices[srvIndex], style: undefined };
        return { ...prev, services: newServices };
      }
      // 6. Experience
      const expIndex = prev.experience.findIndex((e) => e.id === elementId);
      if (expIndex !== -1) {
        const newExp = [...prev.experience];
        newExp[expIndex] = { ...newExp[expIndex], style: undefined };
        return { ...prev, experience: newExp };
      }
      // 7. Hero Elements
      if (elementId === 'hero-headline') {
        return { ...prev, personal: { ...prev.personal, headingStyle: undefined } };
      }
      if (elementId === 'hero-bio') {
        return { ...prev, personal: { ...prev.personal, bioStyle: undefined } };
      }
      if (elementId === 'hero-avatar') {
        return { ...prev, personal: { ...prev.personal, avatarStyle: undefined } };
      }
      return prev;
    });
  }, [updateDraft]);

  const resetResponsiveOverride = useCallback((elementId: string, viewport: 'tablet' | 'mobile') => {
    updateDraft((prev) => {
      const cleanOverride = (st?: ElementStyleConfig) => {
        if (!st) return undefined;
        const copy = { ...st };
        if (viewport === 'tablet') delete copy.tabletOverrides;
        if (viewport === 'mobile') delete copy.mobileOverrides;
        return copy;
      };

      const secIndex = prev.sections.findIndex((s) => s.id === elementId);
      if (secIndex !== -1) {
        const targetSec = prev.sections[secIndex];
        const newSections = [...prev.sections];
        newSections[secIndex] = { ...targetSec, style: cleanOverride(targetSec.style) };
        return { ...prev, sections: newSections };
      }
      return prev;
    });
  }, [updateDraft]);

  // ==========================================
  // Entity Helpers (Projects, Skills, Services, Experience, Nav)
  // ==========================================
  const addProject = useCallback((project?: Partial<ProjectItem>) => {
    updateDraft((prev) => {
      const newProject: ProjectItem = {
        id: `proj-${Date.now()}`,
        title: 'New Digital Project',
        category: 'Web Applications',
        shortDescription: 'Project overview and architectural deliverables summary.',
        technologies: ['React', 'TypeScript', 'Tailwind'],
        imageUrl: prev.media[0]?.url || '',
        isFeatured: false,
        isPopular: false,
        isVisible: true,
        previewEmbedAllowed: false,
        order: prev.projects.length + 1,
        projectStatus: 'In Development',
        ...project
      };
      return { ...prev, projects: [newProject, ...prev.projects] };
    });
  }, [updateDraft]);

  const updateProject = useCallback((id: string, updates: Partial<ProjectItem>) => {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
  }, [updateDraft]);

  const deleteProject = useCallback((id: string) => {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
  }, [updateDraft]);

  const duplicateProject = useCallback((id: string) => {
    updateDraft((prev) => {
      const target = prev.projects.find((p) => p.id === id);
      if (!target) return prev;
      const copy: ProjectItem = {
        ...target,
        id: `proj-${Date.now()}`,
        title: `${target.title} (Duplicate)`,
        order: target.order + 1
      };
      return { ...prev, projects: [copy, ...prev.projects] };
    });
  }, [updateDraft]);

  const reorderProjects = useCallback((sourceIndex: number, destIndex: number) => {
    updateDraft((prev) => {
      const items = [...prev.projects];
      const [removed] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, removed);
      return { ...prev, projects: items.map((p, idx) => ({ ...p, order: idx + 1 })) };
    });
  }, [updateDraft]);

  // Skills
  const addSkill = useCallback((skill?: Partial<SkillItem>) => {
    updateDraft((prev) => {
      const newSkill: SkillItem = {
        id: `skill-${Date.now()}`,
        name: 'New Professional Competency',
        category: 'Web Development',
        proficiencyPercentage: 85,
        description: 'Hands-on practical experience and production usage.',
        iconName: 'Code',
        isVisible: true,
        order: prev.skills.length + 1,
        visualStyle: 'bar',
        ...skill
      };
      return { ...prev, skills: [...prev.skills, newSkill] };
    });
  }, [updateDraft]);

  const updateSkill = useCallback((id: string, updates: Partial<SkillItem>) => {
    updateDraft((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updates } : s))
    }));
  }, [updateDraft]);

  const deleteSkill = useCallback((id: string) => {
    updateDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id)
    }));
  }, [updateDraft]);

  const duplicateSkill = useCallback((id: string) => {
    updateDraft((prev) => {
      const target = prev.skills.find((s) => s.id === id);
      if (!target) return prev;
      const copy: SkillItem = {
        ...target,
        id: `skill-${Date.now()}`,
        name: `${target.name} (Copy)`,
        order: target.order + 1
      };
      return { ...prev, skills: [...prev.skills, copy] };
    });
  }, [updateDraft]);

  // Services
  const addService = useCallback((service?: Partial<ServiceItem>) => {
    updateDraft((prev) => {
      const count = prev.services.length + 1;
      const newSrv: ServiceItem = {
        id: `srv-${Date.now()}`,
        editorialNumber: count < 10 ? `0${count}` : `${count}`,
        title: 'New Specialized Service',
        category: 'Engineering',
        description: 'High-quality tailored scope and client delivery.',
        iconName: 'Code',
        features: ['Scope definition and architecture', 'Responsive delivery', 'Performance testing'],
        ctaLabel: 'Discuss Project',
        isVisible: true,
        order: count,
        ...service
      };
      return { ...prev, services: [...prev.services, newSrv] };
    });
  }, [updateDraft]);

  const updateService = useCallback((id: string, updates: Partial<ServiceItem>) => {
    updateDraft((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s))
    }));
  }, [updateDraft]);

  const deleteService = useCallback((id: string) => {
    updateDraft((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id)
    }));
  }, [updateDraft]);

  const duplicateService = useCallback((id: string) => {
    updateDraft((prev) => {
      const target = prev.services.find((s) => s.id === id);
      if (!target) return prev;
      const count = prev.services.length + 1;
      const copy: ServiceItem = {
        ...target,
        id: `srv-${Date.now()}`,
        title: `${target.title} (Copy)`,
        editorialNumber: count < 10 ? `0${count}` : `${count}`,
        order: count
      };
      return { ...prev, services: [...prev.services, copy] };
    });
  }, [updateDraft]);

  // Experience
  const addExperience = useCallback((exp?: Partial<ExperienceItem>) => {
    updateDraft((prev) => {
      const newExp: ExperienceItem = {
        id: `exp-${Date.now()}`,
        role: 'Specialist Role Title',
        type: 'Client Consulting & Delivery',
        period: '2025 - Present',
        description: 'Key deliverables, technical achievements and project leadership.',
        highlights: ['Designed high-performance architectures', 'Delivered within milestones'],
        isVisible: true,
        order: prev.experience.length + 1,
        ...exp
      };
      return { ...prev, experience: [newExp, ...prev.experience] };
    });
  }, [updateDraft]);

  const updateExperience = useCallback((id: string, updates: Partial<ExperienceItem>) => {
    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...updates } : e))
    }));
  }, [updateDraft]);

  const deleteExperience = useCallback((id: string) => {
    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id)
    }));
  }, [updateDraft]);

  const duplicateExperience = useCallback((id: string) => {
    updateDraft((prev) => {
      const target = prev.experience.find((e) => e.id === id);
      if (!target) return prev;
      const copy: ExperienceItem = {
        ...target,
        id: `exp-${Date.now()}`,
        role: `${target.role} (Copy)`,
        order: target.order + 1
      };
      return { ...prev, experience: [copy, ...prev.experience] };
    });
  }, [updateDraft]);

  // Navigation
  const addNavItem = useCallback((item?: Partial<NavigationItem>) => {
    updateDraft((prev) => {
      const newItem: NavigationItem = {
        id: `nav-${Date.now()}`,
        label: 'New Link',
        href: '#',
        isVisible: true,
        order: prev.navigation.length + 1,
        isDynamic: true,
        ...item
      };
      return { ...prev, navigation: [...prev.navigation, newItem] };
    });
  }, [updateDraft]);

  const updateNavItem = useCallback((id: string, updates: Partial<NavigationItem>) => {
    updateDraft((prev) => ({
      ...prev,
      navigation: prev.navigation.map((n) => (n.id === id ? { ...n, ...updates } : n))
    }));
  }, [updateDraft]);

  const deleteNavItem = useCallback((id: string) => {
    updateDraft((prev) => ({
      ...prev,
      navigation: prev.navigation.filter((n) => n.id !== id)
    }));
  }, [updateDraft]);

  // Media Library Operations
  const getMediaUsage = useCallback((mediaIdOrUrl: string): MediaUsageRef[] => {
    const refs: MediaUsageRef[] = [];
    const media = draftData.media.find((m) => m.id === mediaIdOrUrl || m.url === mediaIdOrUrl);
    const targetUrl = media ? media.url : mediaIdOrUrl;
    const targetId = media ? media.id : mediaIdOrUrl;

    // Check Hero Avatar & Background & About Image
    if (draftData.personal.avatarUrl === targetUrl || draftData.personal.avatarUrl === targetId) {
      refs.push({
        type: 'hero-avatar',
        entityId: 'sec-hero',
        entityTitle: 'Hero Portrait Avatar',
        field: 'personal.avatarUrl'
      });
    }
    if (draftData.personal.heroBackgroundImageUrl === targetUrl || draftData.personal.heroBackgroundImageUrl === targetId) {
      refs.push({
        type: 'section-bg',
        entityId: 'sec-hero-bg',
        entityTitle: 'Hero Background Image',
        field: 'personal.heroBackgroundImageUrl'
      });
    }
    if (draftData.personal.aboutImageUrl === targetUrl || draftData.personal.aboutImageUrl === targetId) {
      refs.push({
        type: 'other',
        entityId: 'sec-about-img',
        entityTitle: 'About Section Feature Image',
        field: 'personal.aboutImageUrl'
      });
    }

    // Check Projects
    for (const proj of draftData.projects) {
      if (proj.imageUrl === targetUrl || proj.imageUrl === targetId) {
        refs.push({
          type: 'project-image',
          entityId: proj.id,
          entityTitle: `Project Main: ${proj.title}`,
          field: 'imageUrl'
        });
      }
      if (proj.galleryImages) {
        proj.galleryImages.forEach((img, idx) => {
          if (img === targetUrl || img === targetId) {
            refs.push({
              type: 'project-gallery',
              entityId: proj.id,
              entityTitle: `Project Gallery: ${proj.title} (image #${idx + 1})`,
              field: `galleryImages[${idx}]`
            });
          }
        });
      }
    }

    // Check Sections background and canvas elements
    for (const sec of draftData.sections) {
      if (sec.backgroundImageUrl === targetUrl || sec.backgroundImageUrl === targetId) {
        refs.push({
          type: 'section-bg',
          entityId: sec.id,
          entityTitle: `Section Background: ${sec.title}`,
          field: 'backgroundImageUrl'
        });
      }
      if (sec.elements) {
        for (const el of sec.elements) {
          if (el.content?.imageUrl === targetUrl || el.content?.imageUrl === targetId) {
            refs.push({
              type: 'custom-element',
              entityId: el.id,
              entityTitle: `Canvas Image (${sec.title})`,
              field: 'content.imageUrl'
            });
          }
        }
      }
    }

    // Check SEO ogImage
    if (draftData.seo.ogImage === targetUrl) {
      refs.push({
        type: 'seo-og',
        entityId: 'seo',
        entityTitle: 'Social Share Card (og:image)',
        field: 'seo.ogImage'
      });
    }

    return refs;
  }, [draftData]);

  const addMediaItem = useCallback((item: Partial<MediaItem> & { url: string; name: string }): MediaItem => {
    const filename = item.filename || item.originalFilename || item.name.toLowerCase().replace(/[^a-z0-9.]+/g, '_');
    const ext = filename.split('.').pop()?.toLowerCase();
    const isVideo = ['mp4', 'webm', 'ogg'].includes(ext || '');
    const isAudio = ['mp3', 'wav', 'aac'].includes(ext || '');
    const isDoc = ['pdf', 'doc', 'docx'].includes(ext || '');
    const mediaType: MediaType = item.mediaType || (isVideo ? 'video' : isAudio ? 'audio' : isDoc ? 'document' : 'image');

    const newItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      filename,
      originalFilename: item.originalFilename || filename,
      name: item.name,
      url: item.url,
      alt: item.alt || item.name,
      altText: item.altText || item.alt || item.name,
      caption: item.caption,
      description: item.description,
      mediaType,
      mimeType: item.mimeType || (isVideo ? 'video/mp4' : isAudio ? 'audio/mpeg' : isDoc ? 'application/pdf' : 'image/jpeg'),
      fileSize: item.fileSize || 'Standard',
      fileSizeBytes: item.fileSizeBytes || 0,
      dimensions: item.dimensions || '1920x1080',
      width: item.width,
      height: item.height,
      usedIn: item.usedIn || [],
      source: item.source || 'upload',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateDraft((prev) => ({
      ...prev,
      media: [newItem, ...prev.media]
    }));
    return newItem;
  }, [updateDraft]);

  const updateMediaItem = useCallback((id: string, updates: Partial<MediaItem>) => {
    updateDraft((prev) => ({
      ...prev,
      media: prev.media.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    }));
  }, [updateDraft]);

  const deleteMediaItem = useCallback((id: string) => {
    updateDraft((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== id)
    }));
  }, [updateDraft]);

  const safeDeleteMedia = useCallback(
    (id: string, force: boolean = false): { success: boolean; usageCount: number; references: MediaUsageRef[] } => {
      const refs = getMediaUsage(id);
      if (refs.length > 0 && !force) {
        return { success: false, usageCount: refs.length, references: refs };
      }

      updateDraft((prev) => {
        const targetMedia = prev.media.find((m) => m.id === id);
        const targetUrl = targetMedia?.url;

        // If force, also clean up references to avoid broken links
        let updatedPersonal = prev.personal;
        if (force && targetUrl && prev.personal.avatarUrl === targetUrl) {
          updatedPersonal = { ...prev.personal, avatarUrl: '' };
        }

        const updatedProjects = prev.projects.map((proj) => {
          if (!force || !targetUrl) return proj;
          return {
            ...proj,
            imageUrl: proj.imageUrl === targetUrl ? '' : proj.imageUrl,
            galleryImages: proj.galleryImages ? proj.galleryImages.filter((img) => img !== targetUrl) : []
          };
        });

        return {
          ...prev,
          personal: updatedPersonal,
          projects: updatedProjects,
          media: prev.media.filter((m) => m.id !== id)
        };
      });

      return { success: true, usageCount: refs.length, references: refs };
    },
    [getMediaUsage, updateDraft]
  );

  const replaceMedia = useCallback(
    (oldMediaId: string, newMediaData: Partial<MediaItem>) => {
      updateDraft((prev) => {
        const oldIndex = prev.media.findIndex((m) => m.id === oldMediaId);
        if (oldIndex === -1) return prev;
        const oldItem = prev.media[oldIndex];
        const oldUrl = oldItem.url;
        const newUrl = newMediaData.url || oldUrl;

        // Keep stable media ID, update properties
        const updatedMediaItem: MediaItem = {
          ...oldItem,
          ...newMediaData,
          id: oldMediaId,
          url: newUrl,
          updatedAt: new Date().toISOString()
        };

        const updatedMediaList = [...prev.media];
        updatedMediaList[oldIndex] = updatedMediaItem;

        // Replace references across the portfolio data model
        let updatedPersonal = prev.personal;
        if (prev.personal.avatarUrl === oldUrl) {
          updatedPersonal = { ...updatedPersonal, avatarUrl: newUrl };
        }
        if (prev.personal.heroBackgroundImageUrl === oldUrl) {
          updatedPersonal = { ...updatedPersonal, heroBackgroundImageUrl: newUrl };
        }
        if (prev.personal.aboutImageUrl === oldUrl) {
          updatedPersonal = { ...updatedPersonal, aboutImageUrl: newUrl };
        }

        const updatedProjects = prev.projects.map((proj) => {
          let modified = false;
          let newImg = proj.imageUrl;
          let newGallery = proj.galleryImages;
          let newPreview = proj.fullWebsitePreviewUrl;

          if (proj.imageUrl === oldUrl) {
            newImg = newUrl;
            modified = true;
          }
          if (proj.fullWebsitePreviewUrl === oldUrl) {
            newPreview = newUrl;
            modified = true;
          }
          if (proj.galleryImages && proj.galleryImages.includes(oldUrl)) {
            newGallery = proj.galleryImages.map((img) => (img === oldUrl ? newUrl : img));
            modified = true;
          }

          return modified
            ? { ...proj, imageUrl: newImg, galleryImages: newGallery, fullWebsitePreviewUrl: newPreview }
            : proj;
        });

        const updatedSections = prev.sections.map((sec) => {
          let modified = false;
          let newBg = sec.backgroundImageUrl;
          let newElements = sec.elements;

          if (sec.backgroundImageUrl === oldUrl) {
            newBg = newUrl;
            modified = true;
          }
          if (sec.elements) {
            newElements = sec.elements.map((el) => {
              if (el.content?.imageUrl === oldUrl) {
                return { ...el, content: { ...el.content, imageUrl: newUrl } };
              }
              return el;
            });
            modified = true;
          }

          return modified ? { ...sec, backgroundImageUrl: newBg, elements: newElements } : sec;
        });

        let updatedSeo = prev.seo;
        if (prev.seo.ogImage === oldUrl) {
          updatedSeo = { ...prev.seo, ogImage: newUrl };
        }

        return {
          ...prev,
          media: updatedMediaList,
          personal: updatedPersonal,
          projects: updatedProjects,
          sections: updatedSections,
          seo: updatedSeo
        };
      });
    },
    [updateDraft]
  );

  const markMediaBroken = useCallback(
    (mediaId: string, isBroken: boolean) => {
      updateDraft((prev) => ({
        ...prev,
        media: prev.media.map((m) =>
          m.id === mediaId || m.url === mediaId ? { ...m, isBroken } : m
        )
      }));
    },
    [updateDraft]
  );

  // Project Gallery Operations
  const addProjectGalleryImage = useCallback(
    (projectId: string, imageUrl: string) => {
      updateDraft((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) => {
          if (proj.id !== projectId) return proj;
          const current = proj.galleryImages || [];
          return { ...proj, galleryImages: [...current, imageUrl] };
        })
      }));
    },
    [updateDraft]
  );

  const removeProjectGalleryImage = useCallback(
    (projectId: string, imageIndex: number) => {
      updateDraft((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) => {
          if (proj.id !== projectId || !proj.galleryImages) return proj;
          const current = [...proj.galleryImages];
          current.splice(imageIndex, 1);
          return { ...proj, galleryImages: current };
        })
      }));
    },
    [updateDraft]
  );

  const reorderProjectGallery = useCallback(
    (projectId: string, sourceIndex: number, destIndex: number) => {
      updateDraft((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) => {
          if (proj.id !== projectId || !proj.galleryImages) return proj;
          const current = [...proj.galleryImages];
          const [moved] = current.splice(sourceIndex, 1);
          current.splice(destIndex, 0, moved);
          return { ...proj, galleryImages: current };
        })
      }));
    },
    [updateDraft]
  );

  const setProjectMainImage = useCallback(
    (projectId: string, imageUrl: string) => {
      updateDraft((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) => {
          if (proj.id !== projectId) return proj;
          return { ...proj, imageUrl };
        })
      }));
    },
    [updateDraft]
  );

  // Media Picker Dialog State
  const openMediaPicker = useCallback(
    (onSelect: (media: MediaItem) => void, filterType: MediaType | 'all' = 'all') => {
      setMediaPickerCallback(() => onSelect);
      setMediaPickerFilter(filterType);
      setIsMediaPickerOpen(true);
    },
    []
  );

  const closeMediaPicker = useCallback(() => {
    setIsMediaPickerOpen(false);
    setMediaPickerCallback(null);
  }, []);

  const confirmMediaPickerSelect = useCallback(
    (media: MediaItem) => {
      if (mediaPickerCallback) {
        mediaPickerCallback(media);
      }
      closeMediaPicker();
    },
    [mediaPickerCallback, closeMediaPicker]
  );

  // Prompt 1 Helpers
  const skipIntro = useCallback(() => {
    setIsIntroActive(false);
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {}
  }, []);

  const replayIntro = useCallback(() => {
    setIsIntroActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setIntroMode = useCallback((mode: IntroDisplayMode) => {
    updateDraft((prev) => ({
      ...prev,
      intro: { ...prev.intro, mode }
    }));
  }, [updateDraft]);

  const exportConfigJson = useCallback((): string => {
    return JSON.stringify(draftData, null, 2);
  }, [draftData]);

  const importConfigJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.personal && parsed.skills) {
        updateDraft(() => normalizePortfolio(parsed));
        return true;
      }
    } catch {}
    return false;
  }, [updateDraft]);

  return (
    <PortfolioContext.Provider
      value={{
        data: activeData,
        draftData,
        publishedData,
        viewMode,
        setViewMode,
        updateDraft,
        updateData: updateDraft,
        undo,
        redo,
        canUndo,
        canRedo,
        autosaveStatus,
        saveDraftManual,
        publishDraft,
        discardDraft,
        resetToDefaults,
        versionHistory,
        restoreVersion,
        networkStatus,
        isStudioRoute,
        setIsStudioRoute,
        isStudioPreviewMode,
        setIsStudioPreviewMode,
        studioViewport,
        setStudioViewport,
        selectedElement,
        setSelectedElement,
        selectParentElement,
        canvasZoom,
        setCanvasZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        isFullscreen,
        setIsFullscreen,
        clipboard,
        copySelected,
        pasteClipboard,
        copiedStyle,
        copyElementStyle,
        pasteElementStyle,
        getElementStyle,
        reorderSections,
        moveSection,
        toggleSectionVisibility,
        duplicateSection,
        deleteSection,
        addSection,
        updateSectionConfig,
        updateSectionStyle,
        insertCanvasElement,
        updateCanvasElement,
        deleteCanvasElement,
        moveCanvasElement,
        updateElementStyle,
        resetElementStyle,
        resetResponsiveOverride,
        addProject,
        updateProject,
        deleteProject,
        duplicateProject,
        reorderProjects,
        addSkill,
        updateSkill,
        deleteSkill,
        duplicateSkill,
        addService,
        updateService,
        deleteService,
        duplicateService,
        addExperience,
        updateExperience,
        deleteExperience,
        duplicateExperience,
        addNavItem,
        updateNavItem,
        deleteNavItem,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        safeDeleteMedia,
        replaceMedia,
        getMediaUsage,
        markMediaBroken,
        isMediaPickerOpen,
        mediaPickerFilter,
        openMediaPicker,
        closeMediaPicker,
        confirmMediaPickerSelect,
        addProjectGalleryImage,
        removeProjectGalleryImage,
        reorderProjectGallery,
        setProjectMainImage,
        auth,
        loginStudio,
        logoutStudio,
        isIntroActive,
        setIsIntroActive,
        replayIntro,
        skipIntro,
        setIntroMode,
        isCustomizerOpen,
        setIsCustomizerOpen,
        exportConfigJson,
        importConfigJson,
        activeSection,
        setActiveSection,
        currentThemePreset: activeThemePreset,
        toggleTheme,
        setThemePreset
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
