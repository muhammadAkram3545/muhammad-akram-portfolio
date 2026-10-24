import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { resolveElementStyles } from '../../utils/styleResolver';
import {
  Code,
  ShoppingBag,
  Layout,
  Box,
  Film,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Code,
  ShoppingBag,
  Layout,
  Box,
  Film,
  Sparkles
};

export const ServicesSection: React.FC = () => {
  const {
    data,
    isStudioRoute,
    isStudioPreviewMode,
    studioViewport,
    selectedElement,
    setSelectedElement
  } = usePortfolio();

  const visibleServices = data.services
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;

  return (
    <section id="services" className="py-24 relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs sm:text-sm font-mono text-amber-400 mb-3 uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Capabilities & Deliverables</span>
          </div>
          <h2 className="section-major-heading">
            Comprehensive digital services.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-normal leading-relaxed">
            Structured engagement capabilities built on engineering standards, high visual fidelity, and measurable outcome focus.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleServices.map((service) => {
            const IconComponent = iconMap[service.iconName] || Code;
            const isSelected = selectedElement?.id === service.id;
            const serviceStyles = resolveElementStyles(service.style, studioViewport);

            return (
              <div
                key={service.id}
                onClick={(e) => {
                  if (canSelectInStudio) {
                    e.stopPropagation();
                    setSelectedElement({
                      type: 'service',
                      id: service.id,
                      label: `Service: ${service.title}`,
                      sublabel: service.category,
                      breadcrumbs: [
                        { id: 'home', label: 'Home', type: 'section' },
                        { id: 'sec-services', label: 'Services', type: 'section' },
                        { id: service.id, label: service.title, type: 'service' }
                      ]
                    });
                  }
                }}
                style={serviceStyles}
                className={`p-8 rounded-2xl border border-white/[0.08] bg-[#0d1017] hover:border-amber-400/40 hover:bg-[#121622] hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-400/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
                } ${
                  isSelected && canSelectInStudio
                    ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10] z-20'
                    : ''
                }`}
              >
                {/* Subtle Top Accent Hairline on Hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/90 transition-all duration-500" />

                {/* Floating Selection Tag */}
                {isSelected && canSelectInStudio && (
                  <span className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-lg">
                    Service Card
                  </span>
                )}

                <div>
                  {/* Top: Editorial Number + Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs text-amber-400 group-hover:text-amber-300 font-bold tracking-widest uppercase transition-colors">
                      {service.editorialNumber}
                    </span>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300 group-hover:text-amber-300 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-wider">
                    {service.category}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors duration-200 font-heading">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                    {service.description}
                  </p>

                  {/* Feature Deliverables List */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06] mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inquiry CTA */}
                <a
                  href="#contact"
                  onClick={(e) => {
                    if (canSelectInStudio) {
                      e.stopPropagation();
                    }
                  }}
                  className="inline-flex items-center justify-between w-full pt-4 border-t border-white/[0.06] text-xs font-semibold text-slate-300 hover:text-white group-hover:text-amber-300 transition-colors group/cta cursor-pointer"
                >
                  <span>{service.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover/cta:translate-x-2 transition-all duration-200" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
