import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { resolveElementStyles } from '../../utils/styleResolver';
import {
  Code,
  FileCode,
  LayoutGrid,
  Globe,
  ShoppingBag,
  Layers,
  Figma,
  PenTool,
  Box,
  Film,
  Cpu,
  TrendingUp,
  Search,
  Sparkles
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Code,
  FileCode,
  LayoutGrid,
  Globe,
  ShoppingBag,
  Layers,
  Figma,
  PenTool,
  Box,
  Film,
  Cpu,
  TrendingUp,
  Search,
  Sparkles
};

export const SkillsSection: React.FC = () => {
  const {
    data,
    isStudioRoute,
    isStudioPreviewMode,
    studioViewport,
    selectedElement,
    setSelectedElement
  } = usePortfolio();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    'All',
    'Web Development',
    'CMS & Platforms',
    'UI/UX & Design',
    'Media & Motion',
    'AI & SEO'
  ];

  const visibleSkills = data.skills
    .filter((skill) => skill.isVisible)
    .filter((skill) => selectedCategory === 'All' || skill.category === selectedCategory)
    .sort((a, b) => a.order - b.order);

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;

  return (
    <section ref={sectionRef} id="skills" className="py-24 relative border-t border-white/[0.06] bg-[#07090e]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs sm:text-sm font-mono text-amber-400 mb-3 uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Technical & Creative Arsenal</span>
            </div>
            <h2 className="section-major-heading">
              Specialized proficiencies & tools.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3 font-normal leading-relaxed">
              Self-assessed working competencies honed across production implementations and design engagements.
            </p>
          </div>

          {/* Interactive Category Filter Segmented Control */}
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
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSkills.map((skill) => {
            const IconComponent = iconMap[skill.iconName] || Code;
            const isSelected = selectedElement?.id === skill.id;
            const skillStyles = resolveElementStyles(skill.style, studioViewport);

            return (
              <div
                key={skill.id}
                onClick={(e) => {
                  if (canSelectInStudio) {
                    e.stopPropagation();
                    setSelectedElement({
                      type: 'skill',
                      id: skill.id,
                      label: `Skill: ${skill.name}`,
                      sublabel: skill.category,
                      breadcrumbs: [
                        { id: 'home', label: 'Home', type: 'section' },
                        { id: 'sec-skills', label: 'Skills', type: 'section' },
                        { id: skill.id, label: skill.name, type: 'skill' }
                      ]
                    });
                  }
                }}
                style={skillStyles}
                className={`p-6 rounded-xl border border-white/[0.08] bg-[#0d1017] hover:border-amber-400/40 hover:bg-[#121622] hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-400/5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
                } ${
                  isSelected && canSelectInStudio
                    ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] z-20'
                    : ''
                }`}
              >
                {/* Subtle Top Accent Hairline on Hover */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/80 transition-all duration-500" />

                {/* Floating Selection Tag */}
                {isSelected && canSelectInStudio && (
                  <span className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-lg">
                    Skill Card
                  </span>
                )}

                <div>
                  {/* Top Row: Icon + Title + Unboxed Category/Badge (NO PILLS) */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-amber-400 group-hover:text-amber-200 group-hover:scale-110 group-hover:bg-amber-400/10 group-hover:border-amber-400/30 transition-all duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      {/* Clean unboxed metadata text */}
                      <div className="text-xs text-slate-500 font-mono">
                        <span>{skill.category}</span>
                        {skill.badgeText && (
                          <>
                            <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
                            <span className="text-amber-400/90 font-medium">{skill.badgeText}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-200 transition-colors duration-200 font-heading">
                    {skill.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                    {skill.description}
                  </p>
                </div>

                {/* Bottom Row: Clear Proficiency Percentage Indicator */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 font-medium">Proficiency</span>
                    <span className="font-mono text-slate-200 group-hover:text-amber-300 font-semibold tabular-nums transition-colors">
                      {skill.proficiencyPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-amber-300 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      style={{ width: hasAnimated ? `${skill.proficiencyPercentage}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
