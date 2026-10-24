import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ThemePreset, IntroDisplayMode, ViewMode, PortfolioData } from '../../types/portfolio';
import {
  X,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  Eye,
  Edit3,
  Check,
  Palette,
  Play,
  Layers,
  Settings
} from 'lucide-react';

export const LivePreviewCustomizer: React.FC = () => {
  const {
    data,
    updateData,
    viewMode,
    setViewMode,
    isCustomizerOpen,
    setIsCustomizerOpen,
    replayIntro,
    resetToDefaults,
    exportConfigJson
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'theme' | 'intro' | 'content' | 'export'>('theme');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isCustomizerOpen) {
    return (
      <button
        onClick={() => setIsCustomizerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#121620] hover:bg-[#1a2130] text-sky-400 border border-white/10 shadow-2xl transition-all hover:scale-105 cursor-pointer text-xs font-mono group"
        title="Open Live Preview & Studio Settings"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
        </span>
        <Sliders className="w-4 h-4 text-slate-300 group-hover:text-sky-400 transition-colors" />
        <span className="text-slate-300 font-medium">Studio Preview</span>
      </button>
    );
  }

  const handleDownload = () => {
    const jsonStr = exportConfigJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muhammad-akram-portfolio-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const themePresets: { id: ThemePreset; name: string; color: string }[] = [
    { id: 'obsidian', name: 'Obsidian Minimal', color: '#38bdf8' },
    { id: 'titanium', name: 'Titanium Teal', color: '#2dd4bf' },
    { id: 'amber-gold', name: 'Warm Amber', color: '#f59e0b' },
    { id: 'emerald', name: 'Deep Emerald', color: '#10b981' },
    { id: 'minimal-light', name: 'Clean Light', color: '#0284c7' }
  ];

  return (
    <div
      role="dialog"
      aria-label="Studio Live Customizer"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-[#0f131a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f0f4f8] animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-[#090b10] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wide text-white">
              STUDIO LIVE PREVIEW
            </h3>
            <div className="text-[10px] text-slate-400">
              Future Admin Panel Architecture
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#161c26] rounded-md p-0.5 border border-white/[0.06] text-[10px] font-mono">
            <button
              onClick={() => setViewMode('draft')}
              className={`px-2 py-0.5 rounded ${
                viewMode === 'draft' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setViewMode('published')}
              className={`px-2 py-0.5 rounded ${
                viewMode === 'published' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live
            </button>
          </div>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] bg-[#0c0f16] text-xs font-mono">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'theme'
              ? 'border-sky-400 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Theme
        </button>
        <button
          onClick={() => setActiveTab('intro')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'intro'
              ? 'border-sky-400 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Intro
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-sky-400 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Edit
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-sky-400 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Export
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5 max-h-[360px] overflow-y-auto space-y-4 text-xs">
        {/* TAB: THEME */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-slate-300 mb-2 font-mono text-[11px]">
                PRESET COLOR & DESIGN TOKENS
              </label>
              <div className="grid grid-cols-2 gap-2">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      updateData((prev: PortfolioData) => ({
                        ...prev,
                        theme: { ...prev.theme, preset: preset.id }
                      }));
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      data.theme.preset === preset.id
                        ? 'bg-sky-500/10 border-sky-400 text-white'
                        : 'bg-[#121620] border-white/[0.08] text-slate-300 hover:border-white/[0.2]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08]">
              <label className="block font-medium text-slate-300 mb-2 font-mono text-[11px]">
                ACCENT GLOW COLOR
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.theme.accentColor}
                  onChange={(e) =>
                    updateData((prev: PortfolioData) => ({
                      ...prev,
                      theme: { ...prev.theme, accentColor: e.target.value }
                    }))
                  }
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-400">{data.theme.accentColor}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INTRO */}
        {activeTab === 'intro' && (
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-slate-300 mb-2 font-mono text-[11px]">
                OPENING EXPERIENCE MODE
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'first_visit', label: 'First Visit Only (Default)' },
                  { id: 'always', label: 'Always Show On Load' },
                  { id: 'on_request', label: 'On Request Only' },
                  { id: 'disabled', label: 'Disabled Completely' }
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                      data.intro.mode === option.id
                        ? 'bg-sky-500/10 border-sky-400 text-white'
                        : 'bg-[#121620] border-white/[0.08] text-slate-300 hover:border-white/[0.15]'
                    }`}
                  >
                    <span>{option.label}</span>
                    <input
                      type="radio"
                      name="intro-mode"
                      checked={data.intro.mode === option.id}
                      onChange={() => {
                        updateData((prev: PortfolioData) => ({
                          ...prev,
                          intro: {
                            ...prev.intro,
                            mode: option.id as IntroDisplayMode
                          }
                        }));
                      }}
                      className="text-sky-400 focus:ring-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  replayIntro();
                  setIsCustomizerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test & Replay Intro Animation Now</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: CONTENT LIVE EDIT */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                HERO HEADLINE (LIVE)
              </label>
              <input
                type="text"
                value={data.personal.headline}
                onChange={(e) =>
                  updateData((prev: PortfolioData) => ({
                    ...prev,
                    personal: { ...prev.personal, headline: e.target.value }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 text-xs focus:border-sky-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                AVAILABILITY NOTE
              </label>
              <input
                type="text"
                value={data.personal.availabilityNote}
                onChange={(e) =>
                  updateData((prev: PortfolioData) => ({
                    ...prev,
                    personal: { ...prev.personal, availabilityNote: e.target.value }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-[#090b10] border border-white/10 rounded text-slate-200 text-xs focus:border-sky-400 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#121620] border border-white/[0.08]">
              <div>
                <div className="font-semibold text-white">Available For Work Status</div>
                <div className="text-[10px] text-slate-400">Controls green status badge</div>
              </div>
              <input
                type="checkbox"
                checked={data.personal.isAvailableForWork}
                onChange={(e) =>
                  updateData((prev: PortfolioData) => ({
                    ...prev,
                    personal: { ...prev.personal, isAvailableForWork: e.target.checked },
                    contact: { ...prev.contact, availableForWork: e.target.checked }
                  }))
                }
                className="w-4 h-4 text-sky-400 rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              Export the current site state as a complete JSON manifest ready for the future visual Admin Panel database synchronization.
            </p>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium transition-colors cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Config Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download schema.json</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-white/[0.08]">
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Clean Defaults</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-5 py-2.5 bg-[#090b10] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Status: Synchronized</span>
        <span>Muhammad Akram Portfolio</span>
      </div>
    </div>
  );
};
