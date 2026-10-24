import React from 'react';
import { SectionConfig, CanvasElement } from '../../types/portfolio';
import { resolveElementStyles } from '../../utils/styleResolver';
import { usePortfolio } from '../../context/PortfolioContext';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';

interface CustomSectionProps {
  section: SectionConfig;
}

export const CustomSection: React.FC<CustomSectionProps> = ({ section }) => {
  const { studioViewport, selectedElement, setSelectedElement, insertCanvasElement } = usePortfolio();

  const paddingMap = {
    none: 'py-0',
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32'
  };

  const defaultPy = paddingMap[section.paddingTop || 'lg'];
  const customStyles = resolveElementStyles(section.style, studioViewport);

  const renderCanvasElement = (el: CanvasElement) => {
    const isSelected = selectedElement?.id === el.id;
    const elStyles = resolveElementStyles(el.style, studioViewport);

    return (
      <div
        key={el.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement({
            type: 'element',
            id: el.id,
            sectionId: section.id,
            parentId: section.id,
            label: `${el.type.toUpperCase()}: ${el.content.text || el.type}`,
            breadcrumbs: [
              { id: 'home', label: 'Home', type: 'section' },
              { id: section.id, label: section.title, type: 'section' },
              { id: el.id, label: el.type, type: 'element' }
            ]
          });
        }}
        className={`relative transition-all ${
          isSelected ? 'ring-2 ring-sky-400 rounded-lg' : 'hover:ring-1 hover:ring-sky-400/40 rounded-lg'
        }`}
        style={elStyles}
      >
        {el.type === 'heading' && (
          <h3 className="text-2xl font-bold font-heading text-white">
            {el.content.text || 'Section Heading'}
          </h3>
        )}

        {el.type === 'paragraph' && (
          <p className="text-slate-300 text-base leading-relaxed">
            {el.content.text || 'Custom paragraph body text content.'}
          </p>
        )}

        {el.type === 'button' && (
          <a
            href={el.content.url || '#'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs transition-colors"
          >
            <span>{el.content.text || 'Button CTA'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}

        {el.type === 'image' && (
          <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10">
            <img
              src={el.content.imageUrl?.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
              alt={el.content.altText || 'Custom visual'}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {el.type === 'divider' && (
          <div className="w-full h-[1px] bg-white/10 my-4" />
        )}

        {el.type === 'card' && (
          <div className="p-6 rounded-xl border border-white/10 bg-[#0f131a]">
            <h4 className="font-semibold text-white mb-2">{el.content.text || 'Card Title'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Container card component with customized styling.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id={section.internalId}
      className={`${defaultPy} relative border-t border-white/[0.06]`}
      style={{
        backgroundColor: section.backgroundColor || undefined,
        backgroundImage: section.backgroundImageUrl ? `url(${section.backgroundImageUrl})` : undefined,
        ...customStyles
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono text-sky-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{section.title}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {section.customTitle || 'Customized Content Block'}
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
            {section.customContent ||
              'This is a custom portfolio block configured via the Visual Studio builder. Content and layout parameters can be customized dynamically.'}
          </p>

          {/* Render child elements if present */}
          {section.elements && section.elements.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              {section.elements.map(renderCanvasElement)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
