import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StudioViewport } from '../../types/portfolio';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  Save,
  Send,
  User,
  LogOut,
  ExternalLink,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  SlidersHorizontal
} from 'lucide-react';
import { PublishModal } from './PublishModal';

interface StudioTopBarProps {
  onTogglePreview: () => void;
  isPreviewMode: boolean;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({ onTogglePreview, isPreviewMode }) => {
  const {
    draftData,
    studioViewport,
    setStudioViewport,
    undo,
    redo,
    canUndo,
    canRedo,
    autosaveStatus,
    saveDraftManual,
    auth,
    logoutStudio,
    setIsStudioRoute,
    canvasZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    isFullscreen,
    setIsFullscreen
  } = usePortfolio();

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleExitToPublic = () => {
    setIsStudioRoute(false);
    if (window.location.hash.includes('studio') || window.location.hash.includes('admin')) {
      window.location.hash = '';
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <>
      <header className="h-14 bg-[#090b10] border-b border-white/[0.08] px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none text-slate-300">
        {/* LEFT ZONE: Studio Brand & Project Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-heading font-bold text-xs">
              MA
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>PORTFOLIO STUDIO</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  VISUAL BUILDER
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="hidden sm:inline">{draftData.personal.fullName}</span>
                <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
                {/* Autosave status indicator */}
                <span className="flex items-center gap-1">
                  {autosaveStatus === 'saving' && (
                    <>
                      <RefreshCw className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                      <span className="text-amber-400">Saving...</span>
                    </>
                  )}
                  {autosaveStatus === 'saved' && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Saved</span>
                    </>
                  )}
                  {autosaveStatus === 'unsaved' && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-slate-400">Unsaved</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER ZONE: Viewport Preview Switcher & Canvas Zoom */}
        <div className="flex items-center gap-2">
          {/* Viewports */}
          <div className="flex items-center bg-[#121620] border border-white/[0.08] p-1 rounded-xl">
            <button
              onClick={() => setStudioViewport('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                studioViewport === 'desktop'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop Viewport (~1440px)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[11px]">Desktop</span>
            </button>

            <button
              onClick={() => setStudioViewport('tablet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                studioViewport === 'tablet'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet Viewport (~768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[11px]">Tablet</span>
            </button>

            <button
              onClick={() => setStudioViewport('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                studioViewport === 'mobile'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Viewport (~375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[11px]">Mobile</span>
            </button>
          </div>

          {/* Canvas Zoom Controls */}
          <div className="hidden lg:flex items-center bg-[#121620] border border-white/[0.08] rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={zoomOut}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/[0.04]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-2 text-[11px] text-slate-300 hover:text-white"
              title="Reset Zoom to 100%"
            >
              {Math.round(canvasZoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/[0.04]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT ZONE: History, Draft Actions, Publish & Profile */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#121620] border border-white/[0.08] rounded-lg p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors ${
                canUndo ? 'text-slate-300 hover:text-white hover:bg-white/[0.04]' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors ${
                canRedo ? 'text-slate-300 hover:text-white hover:bg-white/[0.04]' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg transition-colors cursor-pointer hidden sm:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Clean Draft Preview Toggle */}
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isPreviewMode
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-white/[0.03] text-slate-300 hover:text-white border-white/10'
            }`}
            title="Toggle Clean Preview (hide builder inspector)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>

          {/* Save Draft manual */}
          <button
            onClick={saveDraftManual}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg transition-colors cursor-pointer"
            title="Save draft to local storage"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={() => setPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors cursor-pointer shadow-sm shadow-sky-500/25"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          {/* Profile / Exit Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="p-1.5 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg transition-colors cursor-pointer"
              title="Studio Account & Navigation"
            >
              <User className="w-4 h-4" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0f131a] border border-white/10 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                  <div className="font-semibold text-white truncate">{auth.userEmail || 'admin@muhammadakram.dev'}</div>
                  <div className="text-[10px] text-sky-400 font-mono capitalize">{auth.role || 'Super Admin'}</div>
                </div>

                <button
                  onClick={handleExitToPublic}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Public Website</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logoutStudio();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock / Logout Studio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Publish Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
      />
    </>
  );
};
