import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { resolveElementStyles } from '../../utils/styleResolver';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const {
    data,
    isStudioRoute,
    isStudioPreviewMode,
    studioViewport,
    selectedElement,
    setSelectedElement
  } = usePortfolio();

  const visibleExperience = data.experience
    .filter((exp) => exp.isVisible)
    .sort((a, b) => a.order - b.order);

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;

  return (
    <section id="experience" className="py-24 relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs sm:text-sm font-mono text-amber-400 mb-3 uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Career Milestones</span>
          </div>
          <h2 className="section-major-heading">
            Professional trajectory & focus areas.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-normal leading-relaxed">
            A documented history of technical execution, design delivery, and client consulting.
          </p>
        </div>

        {/* Timeline Stack */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 sm:before:left-5 before:w-[1px] before:bg-white/[0.08]">
          {visibleExperience.map((item) => {
            const isSelected = selectedElement?.id === item.id;
            const expStyles = resolveElementStyles(item.style, studioViewport);

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  if (canSelectInStudio) {
                    e.stopPropagation();
                    setSelectedElement({
                      type: 'experience',
                      id: item.id,
                      label: `Experience: ${item.role}`,
                      sublabel: item.type,
                      breadcrumbs: [
                        { id: 'home', label: 'Home', type: 'section' },
                        { id: 'sec-experience', label: 'Experience', type: 'section' },
                        { id: item.id, label: item.role, type: 'experience' }
                      ]
                    });
                  }
                }}
                className="relative pl-10 sm:pl-14 group"
              >
                {/* Timeline Node Dot */}
                <div className="absolute left-2 sm:left-3.5 top-1.5 w-3.5 h-3.5 -translate-x-1/2 rounded-full border-2 border-amber-400 bg-[#090b10] group-hover:scale-125 group-hover:bg-amber-400/20 transition-all duration-300" />

                {/* Card Container */}
                <div
                  style={expStyles}
                  className={`p-6 sm:p-8 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:border-amber-400/40 hover:bg-[#121622] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300 relative overflow-hidden group/card ${
                    canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
                  } ${
                    isSelected && canSelectInStudio
                      ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] z-20'
                      : ''
                  }`}
                >
                  {/* Subtle Top Accent Hairline on Hover */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover/card:via-amber-400/80 transition-all duration-500" />

                  {/* Floating Selection Tag */}
                  {isSelected && canSelectInStudio && (
                    <span className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-lg">
                      Milestone Card
                    </span>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover/card:text-amber-200 transition-colors font-heading">
                      {item.role}
                    </h3>
                    {/* Clean unboxed period metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.period}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono mb-4">
                    {item.type}
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                    {item.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{highlight}</span>
                      </div>
                    ))}
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
