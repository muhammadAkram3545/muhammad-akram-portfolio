import React from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { AlignEndHorizontal, ArrowUp, Share2, Compass, Eye, EyeOff } from 'lucide-react';

export const FooterSectionEditor: React.FC = () => {
  const { draftData, updateData, toggleSectionVisibility } = usePortfolio();

  const footer = draftData.footer || {
    brandStatement: 'Designed with precision & engineered for performance.',
    copyrightText: '© 2026 Muhammad Akram. All rights reserved.',
    showBackToTop: true,
    showSocials: true,
    showQuickLinks: true
  };

  const footerSection = draftData.sections?.find((s) => (s.type as string) === 'footer' || s.id === 'sec-footer');
  const isFooterVisible = footerSection ? footerSection.isVisible !== false : true;

  const handleUpdateFooter = (field: string, value: any) => {
    updateData((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🦶 Footer & Copyright</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the bottom footer branding statement, copyright text, and navigation links.
          </p>
        </div>

        {footerSection && (
          <button
            onClick={() => toggleSectionVisibility(footerSection.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              isFooterVisible
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
            }`}
          >
            {isFooterVisible ? (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Section Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Section Hidden</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Card 1: Brand Statement & Copyright */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <AlignEndHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Footer Copy & Statement</h3>
            <p className="text-xs text-slate-400">Information presented at the bottom of the page</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Footer Brand Statement
            </label>
            <textarea
              rows={2}
              value={footer.brandStatement || ''}
              onChange={(e) => handleUpdateFooter('brandStatement', e.target.value)}
              placeholder="Designed with precision & engineered for performance."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Copyright Text Line
            </label>
            <input
              type="text"
              value={footer.copyrightText || ''}
              onChange={(e) => handleUpdateFooter('copyrightText', e.target.value)}
              placeholder="© 2026 Muhammad Akram. All rights reserved."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Footer Toggles */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Footer Elements & Links</h3>
          <p className="text-xs text-slate-400">Toggle secondary footer navigation and interactive widgets</p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Back to top toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161c26] border border-white/10">
            <div className="flex items-center gap-2.5">
              <ArrowUp className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-xs font-medium text-white">Floating "Back to Top" Button</div>
                <div className="text-[11px] text-slate-400">Allows visitors to smoothly scroll back to hero</div>
              </div>
            </div>
            <button
              onClick={() => handleUpdateFooter('showBackToTop', !footer.showBackToTop)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                footer.showBackToTop ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  footer.showBackToTop ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Socials toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161c26] border border-white/10">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-medium text-white">Social Media Links Grid</div>
                <div className="text-[11px] text-slate-400">Display profile icons in footer bottom row</div>
              </div>
            </div>
            <button
              onClick={() => handleUpdateFooter('showSocials', footer.showSocials !== false ? false : true)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                footer.showSocials !== false ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  footer.showSocials !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Quick Links toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161c26] border border-white/10">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-medium text-white">Quick Navigation Links Column</div>
                <div className="text-[11px] text-slate-400">Show site directory links in the footer</div>
              </div>
            </div>
            <button
              onClick={() => handleUpdateFooter('showQuickLinks', footer.showQuickLinks !== false ? false : true)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                footer.showQuickLinks !== false ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  footer.showQuickLinks !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
