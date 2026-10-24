import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { DashboardTab } from '../../types/dashboard';
import {
  Menu,
  Save,
  Eye,
  Send,
  History,
  Sun,
  Moon,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardTopBarProps {
  activeTab: DashboardTab;
  onOpenMobileMenu: () => void;
  onOpenPublish: () => void;
  onOpenVersions: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  isCanvasMode: boolean;
  onToggleCanvasMode: () => void;
}

const tabTitles: Record<DashboardTab, string> = {
  dashboard: '📊 Dashboard Overview',
  home: '🏠 Home & Hero Banner',
  about: '👤 About & Bio Narrative',
  skills: '🛠 Skills & Competencies',
  services: '💼 Services & Solutions',
  projects: '📁 Projects Showcase',
  experience: '🧰 Career Experience',
  contact: '📩 Contact & Inquiries',
  socials: '🔗 Social Links',
  media: '🖼 Media Library Vault',
  navigation: '🧭 Header Navigation',
  footer: '🦶 Footer & Copyright',
  settings: '⚙️ Settings & Theme'
};

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenPublish,
  onOpenVersions,
  onTogglePreview,
  isPreviewMode,
  isCanvasMode,
  onToggleCanvasMode
}) => {
  const {
    draftData,
    updateData,
    autosaveStatus,
    saveDraftManual,
    setIsStudioRoute
  } = usePortfolio();

  const [confirmExitDialog, setConfirmExitDialog] = useState(false);
  const isLightMode = draftData.theme?.preset === 'minimal-light';
  const isUnsaved = autosaveStatus === 'unsaved';

  const toggleTheme = () => {
    const nextPreset = isLightMode ? 'obsidian' : 'minimal-light';
    updateData((prev) => ({
      ...prev,
      theme: { ...prev.theme, preset: nextPreset }
    }));
  };

  const handleExitStudio = () => {
    if (isUnsaved) {
      setConfirmExitDialog(true);
    } else {
      setIsStudioRoute(false);
      window.location.hash = '';
    }
  };

  return (
    <>
      <header className="h-14 bg-[#090b10] border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0 select-none relative z-30">
        {/* Left: Mobile hamburger + Active Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {tabTitles[activeTab]}
            </span>
          </div>
        </div>

        {/* Right: Unsaved indicator + Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Unsaved Changes status badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {isUnsaved ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">All changes saved</span>
              </>
            )}
          </div>

          {/* Save Draft Button */}
          <button
            onClick={() => saveDraftManual()}
            title="Save changes to draft"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
              isUnsaved
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-500/40 shadow-xs'
                : 'bg-white/[0.06] hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Preview Toggle */}
          <button
            onClick={onTogglePreview}
            title={isPreviewMode ? 'Exit preview' : 'Preview draft'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
              isPreviewMode
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                : 'bg-white/[0.06] hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPreviewMode ? 'Close Preview' : 'Preview'}
            </span>
          </button>

          {/* Publish Live Button */}
          <button
            onClick={onOpenPublish}
            title="Publish verified updates live to production"
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />

          {/* Version History Button */}
          <button
            onClick={onOpenVersions}
            title="Inspect historical releases and rollbacks"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Visual Canvas Mode Toggle */}
          <button
            onClick={onToggleCanvasMode}
            title={isCanvasMode ? 'Switch to Form Editor' : 'Switch to Visual Canvas'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isCanvasMode
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light / Dark mode"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {isLightMode ? (
              <Moon className="w-4 h-4 text-sky-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Exit Studio to Live Site */}
          <button
            onClick={handleExitStudio}
            title="Return to public portfolio"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Unsaved Changes Confirmation Modal */}
      {confirmExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f141d] border border-white/15 p-5 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Unsaved Changes</h3>
                <p className="text-xs text-slate-400">
                  You have draft modifications that have not been saved.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  saveDraftManual();
                  setConfirmExitDialog(false);
                  setIsStudioRoute(false);
                  window.location.hash = '';
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs cursor-pointer"
              >
                Save & Exit
              </button>
              <button
                onClick={() => {
                  setConfirmExitDialog(false);
                  setIsStudioRoute(false);
                  window.location.hash = '';
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs cursor-pointer"
              >
                Discard & Exit
              </button>
              <button
                onClick={() => setConfirmExitDialog(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-slate-300 text-xs cursor-pointer"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
