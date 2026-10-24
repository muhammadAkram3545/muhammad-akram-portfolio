import React from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  Settings,
  Sun,
  Moon,
  Sparkles,
  Search,
  Globe,
  Sliders,
  Play
} from 'lucide-react';
import { MobileImageUploadField } from '../../common/MobileImageUploadField';

export const SettingsSectionEditor: React.FC = () => {
  const { draftData, updateData, replayIntro, openMediaPicker } = usePortfolio();

  const theme = draftData.theme || {
    preset: 'obsidian',
    accentColor: '#38bdf8'
  };

  const intro = draftData.intro || {
    mode: 'first_visit',
    greetingText: 'Digital Portfolio Experience',
    brandMonogram: 'MA',
    durationSeconds: 2.8,
    showSkipButton: true,
    enableSoundFx: false
  };

  const seo = draftData.seo || {
    pageTitle: 'Muhammad Akram — Digital Creator & Architect',
    metaDescription: 'Multi-disciplinary digital creator bridging clean engineering, spatial design & intelligent interfaces.',
    keywords: [],
    ogImage: '/assets/images/showcase_web_saas_1791008421310.jpg'
  };

  const isLightMode = theme.preset === 'minimal-light';

  const handleSetThemeMode = (mode: 'dark' | 'light') => {
    const nextPreset = mode === 'light' ? 'minimal-light' : 'obsidian';
    updateData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        preset: nextPreset,
        accentColor: mode === 'light' ? '#0284c7' : '#38bdf8'
      }
    }));
  };

  const handleUpdateIntro = (field: string, value: any) => {
    updateData((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        [field]: value
      }
    }));
  };

  const handleUpdateSeo = (field: string, value: any) => {
    updateData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⚙️ Global Settings & Theme</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize website visual color mode, opening animation sequence, and search engine metadata.
        </p>
      </div>

      {/* Card 1: Theme Mode Switcher */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Portfolio Color Theme</h3>
            <p className="text-xs text-slate-400">
              Switch between the dark obsidian foundation and clean high-contrast light mode
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Dark Mode Option */}
          <div
            onClick={() => handleSetThemeMode('dark')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
              !isLightMode
                ? 'bg-sky-500/10 border-sky-500 text-white shadow-xs'
                : 'bg-[#161c26] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Moon className="w-4 h-4 text-sky-400" />
                <span>🌑 Dark Mode (Obsidian)</span>
              </div>
              {!isLightMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Charcoal/slate background with subtle glow, optimized for developer and technical audiences.
            </p>
          </div>

          {/* Light Mode Option */}
          <div
            onClick={() => handleSetThemeMode('light')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
              isLightMode
                ? 'bg-sky-500/10 border-sky-500 text-white shadow-xs'
                : 'bg-[#161c26] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>☀️ Light Mode (Clean White)</span>
              </div>
              {isLightMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Crisp white surfaces with high-contrast slate typography and deep ocean blue accents.
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Intro Animation Experience */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Opening Intro Experience</h3>
              <p className="text-xs text-slate-400">Interactive intro played when visitors land on your site</p>
            </div>
          </div>
          <button
            onClick={() => replayIntro()}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            <span>Test Replay</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Display Mode
            </label>
            <select
              value={intro.mode}
              onChange={(e) => handleUpdateIntro('mode', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
            >
              <option value="first_visit">First Visit Only (Recommended)</option>
              <option value="always">Every Visit</option>
              <option value="on_request">On Request Only</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Brand Monogram
            </label>
            <input
              type="text"
              value={intro.brandMonogram || 'MA'}
              onChange={(e) => handleUpdateIntro('brandMonogram', e.target.value)}
              maxLength={4}
              placeholder="MA"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Duration: {intro.durationSeconds}s
            </label>
            <input
              type="range"
              min="1.5"
              max="5.0"
              step="0.1"
              value={intro.durationSeconds}
              onChange={(e) => handleUpdateIntro('durationSeconds', parseFloat(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer mt-2"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Greeting Text
            </label>
            <input
              type="text"
              value={intro.greetingText || ''}
              onChange={(e) => handleUpdateIntro('greetingText', e.target.value)}
              placeholder="Digital Portfolio Experience"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 3: SEO & Search Metadata */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-slate-400">Meta tags and titles indexed by Google and shared on social networks</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Browser Tab Title
            </label>
            <input
              type="text"
              value={seo.pageTitle || ''}
              onChange={(e) => handleUpdateSeo('pageTitle', e.target.value)}
              placeholder="Muhammad Akram — Digital Creator & Architect"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={seo.metaDescription || ''}
              onChange={(e) => handleUpdateSeo('metaDescription', e.target.value)}
              placeholder="Brief summary appearing in Google search results..."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords || ''}
                onChange={(e) =>
                  handleUpdateSeo(
                    'keywords',
                    e.target.value.split(',').map((k) => k.trim()).filter(Boolean)
                  )
                }
                placeholder="Web Developer, React, Next.js, UI Designer, SEO"
                className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 font-mono"
              />
            </div>

            <div className="pt-2">
              <MobileImageUploadField
                label="Social Share & OpenGraph Card Preview (og:image)"
                description="Thumbnail image rendered when your portfolio link is shared on WhatsApp, LinkedIn, X/Twitter, or Slack."
                value={seo.ogImage || ''}
                onChange={(url) => handleUpdateSeo('ogImage', url)}
                onOpenVault={() =>
                  openMediaPicker((media) => {
                    handleUpdateSeo('ogImage', media.url);
                  }, 'image')
                }
                aspectRatio="video"
                allowClear={true}
                placeholderText="e.g. /assets/images/... or https://..."
              />
            </div>
          </div>
        </div>
    </div>
  );
};
