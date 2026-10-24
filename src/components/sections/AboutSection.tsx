import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { ArrowRight, Layers, Terminal, Sparkles, Wand2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { data, isStudioRoute, isStudioPreviewMode, selectedElement, setSelectedElement } = usePortfolio();

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;
  const isSelected = selectedElement?.id === 'sec-about' || selectedElement?.type === 'about';

  return (
    <section id="about" className="py-24 relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          onClick={(e) => {
            if (canSelectInStudio) {
              e.stopPropagation();
              setSelectedElement({
                type: 'about',
                id: 'sec-about',
                label: 'About The Creator',
                breadcrumbs: [
                  { id: 'home', label: 'Home', type: 'section' },
                  { id: 'sec-about', label: 'About', type: 'about' }
                ]
              });
            }
          }}
          className={`mb-16 max-w-4xl lg:max-w-5xl xl:max-w-6xl p-2 -m-2 rounded-xl transition-all relative ${
            canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
          } ${isSelected && canSelectInStudio ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10]' : ''}`}
        >
          {isSelected && canSelectInStudio && (
            <span className="absolute -top-3 left-2 px-1.5 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-md">
              About Section
            </span>
          )}
          <div className="text-xs sm:text-sm font-mono text-amber-400 mb-3 uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>About The Creator</span>
          </div>

          <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-10 mt-2">
            {/* [ ABOUT HEADING ] on the LEFT */}
            <h2 className="section-major-heading flex-1 min-w-0">
              {data.personal.aboutSectionTitle || 'Bridging technical precision with aesthetic intuition.'}
            </h2>

            {/* [ CIRCULAR PROFILE IMAGE ] on the RIGHT with increased size */}
            <div className="relative shrink-0 group/avatar self-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full p-1 sm:p-1.5 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-xl shadow-amber-400/20 ring-2 ring-white/10 overflow-hidden transition-all duration-300 group-hover/avatar:scale-105 group-hover/avatar:shadow-amber-400/35">
                <img
                  src={resolveAssetUrl(data.personal.aboutImageUrl || data.personal.avatarUrl || '/assets/images/akram_hero_cutout_portrait.png')}
                  alt="Muhammad Akram Profile"
                  className="w-full h-full object-cover object-top rounded-full bg-[#0f131a] aspect-square"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('akram_hero_cutout_portrait.png')) {
                      target.src = resolveAssetUrl('/assets/images/akram_hero_cutout_portrait.png');
                    }
                  }}
                />
              </div>
              <span
                className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 rounded-full bg-emerald-500 border-2 border-[#090b10] shadow-sm ring-1 ring-emerald-400/40"
                title="Active & Available"
              />
            </div>
          </div>
        </div>

        {/* Optional Philosophy Quote Banner */}
        {data.personal.aboutQuote && (
          <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-[#0f131a] border border-white/[0.08] relative overflow-hidden group hover:border-amber-400/30 transition-colors">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/60 transition-all duration-500" />
            <div className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold mb-3">
              Philosophy & Focus
            </div>
            <p className="text-lg sm:text-xl text-slate-100 italic font-medium leading-relaxed font-heading">
              "{data.personal.aboutQuote}"
            </p>
            {data.personal.aboutQuoteAuthor && (
              <div className="text-xs font-mono text-slate-400 mt-3 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-amber-400/60" />
                <span>{data.personal.aboutQuoteAuthor}</span>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Narrative Prose */}
          <div className="lg:col-span-7 space-y-6 text-slate-300 text-base sm:text-lg leading-relaxed">
            {data.personal.detailedBio.map((paragraph, index) => (
              <p key={index} className="text-slate-300 leading-relaxed font-normal">
                {paragraph}
              </p>
            ))}

            <div className="pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-400/90 mb-3 font-mono">
                Core Development Competencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">WordPress CMS Development</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">Shopify Store Customization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">HTML5, CSS3 & JavaScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">Bootstrap & Responsive UI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">Figma UI/UX & Wireframing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">Distributed Git Version Control</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
              >
                <span>Inquire about collaboration</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Key Principles & Core Pillars with Full Card Hover */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:bg-[#121622] hover:border-amber-400/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300 group/pillar relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover/pillar:via-amber-400/70 transition-all duration-500" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-amber-400 group-hover/pillar:scale-110 group-hover/pillar:bg-amber-400/10 group-hover/pillar:border-amber-400/30 transition-all duration-300">
                  <Terminal className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-white group-hover/pillar:text-amber-200 transition-colors font-heading">
                  Production-Ready Code
                </h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed pl-1">
                Prioritizing clean architecture, modularity, fast load times, and semantic standards that stand the test of scaling.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:bg-[#121622] hover:border-amber-400/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300 group/pillar relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover/pillar:via-amber-400/70 transition-all duration-500" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-amber-400 group-hover/pillar:scale-110 group-hover/pillar:bg-amber-400/10 group-hover/pillar:border-amber-400/30 transition-all duration-300">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-white group-hover/pillar:text-amber-200 transition-colors font-heading">
                  Visual Cohesion & Craft
                </h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed pl-1">
                Every layout, typeface pairing, and 3D asset is aligned with mathematical rhythm and user-centric clarity.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:bg-[#121622] hover:border-amber-400/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300 group/pillar relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover/pillar:via-amber-400/70 transition-all duration-500" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-amber-400 group-hover/pillar:scale-110 group-hover/pillar:bg-amber-400/10 group-hover/pillar:border-amber-400/30 transition-all duration-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-white group-hover/pillar:text-amber-200 transition-colors font-heading">
                  Intelligent Modern Tooling
                </h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed pl-1">
                Leveraging modern AI-augmented workflows and data-driven SEO techniques to amplify business outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
