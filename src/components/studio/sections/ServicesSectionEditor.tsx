import React, { useState } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { ServiceItem } from '../../../types/portfolio';
import {
  Briefcase,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Layers,
  Code,
  Layout,
  Palette,
  Video,
  Sparkles,
  Terminal,
  Globe,
  Smartphone,
  Shield
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Briefcase', label: 'Briefcase' },
  { id: 'Code', label: 'Code' },
  { id: 'Layout', label: 'Layout' },
  { id: 'Palette', label: 'Palette' },
  { id: 'Video', label: 'Video' },
  { id: 'Sparkles', label: 'Sparkles' },
  { id: 'Terminal', label: 'Terminal' },
  { id: 'Globe', label: 'Globe' },
  { id: 'Smartphone', label: 'Mobile' },
  { id: 'Shield', label: 'Security' }
];

export const ServicesSectionEditor: React.FC = () => {
  const {
    draftData,
    addService,
    updateService,
    deleteService,
    toggleSectionVisibility
  } = usePortfolio();

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Web & Architecture');
  const [newDescription, setNewDescription] = useState('');
  const [newCtaLabel, setNewCtaLabel] = useState('Request Service');
  const [newCtaUrl, setNewCtaUrl] = useState('#contact');
  const [newIcon, setNewIcon] = useState('Briefcase');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const services = draftData.services || [];
  const servicesSection = draftData.sections?.find((s) => s.type === 'services');
  const isServicesVisible = servicesSection ? servicesSection.isVisible !== false : true;

  const handleAddNewService = () => {
    if (!newTitle.trim()) return;
    const nextNumber = String(services.length + 1).padStart(2, '0');
    addService({
      title: newTitle.trim(),
      editorialNumber: nextNumber,
      category: newCategory,
      description: newDescription.trim() || `Professional ${newTitle.trim()} solutions.`,
      features: ['Full-lifecycle implementation', 'Clean modular architecture', 'Performance optimized'],
      ctaLabel: newCtaLabel.trim() || 'Inquire Now',
      ctaUrl: newCtaUrl.trim() || '#contact',
      iconName: newIcon,
      isVisible: true,
      order: services.length + 1
    });
    setNewTitle('');
    setNewDescription('');
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === services.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = services[index];
    const target = services[targetIndex];

    updateService(current.id, { order: target.order || targetIndex + 1 });
    updateService(target.id, { order: current.order || index + 1 });
  };

  const handleAddFeatureToService = (serviceId: string, currentFeatures: string[]) => {
    if (!newFeatureText.trim()) return;
    updateService(serviceId, {
      features: [...(currentFeatures || []), newFeatureText.trim()]
    });
    setNewFeatureText('');
  };

  const handleRemoveFeatureFromService = (serviceId: string, currentFeatures: string[], fIndex: number) => {
    const updated = [...(currentFeatures || [])];
    updated.splice(fIndex, 1);
    updateService(serviceId, { features: updated });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>💼 Services & Solutions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your service offerings, feature deliverables, icons, and call-to-action buttons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {servicesSection && (
            <button
              onClick={() => toggleSectionVisibility(servicesSection.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isServicesVisible
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
              }`}
            >
              {isServicesVisible ? (
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

          <div className="text-xs font-mono text-slate-400 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.06]">
            {services.length} Services
          </div>
        </div>
      </div>

      {/* Card 1: Add Service */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Add New Client Service</h3>
            <p className="text-xs text-slate-400">Create a client service card</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Service Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Full-Stack Web Development"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Web Development / UI Design"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Icon Symbol
            </label>
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
            >
              {ICON_OPTIONS.map((i) => (
                <option key={i.id} value={i.id} className="bg-[#161c26]">
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Service Description
            </label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the value, tech stack, and scope..."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Button CTA Text
            </label>
            <input
              type="text"
              value={newCtaLabel}
              onChange={(e) => setNewCtaLabel(e.target.value)}
              placeholder="Request Service"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Button Target Link
            </label>
            <input
              type="text"
              value={newCtaUrl}
              onChange={(e) => setNewCtaUrl(e.target.value)}
              placeholder="#contact"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.04]">
          <button
            onClick={handleAddNewService}
            disabled={!newTitle.trim()}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Service</span>
          </button>
        </div>
      </div>

      {/* Card 2: Existing Services with Reorder & Deliverables */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white px-1">Active Services List</h3>

        <div className="space-y-3">
          {services.map((service, idx) => {
            const isDeleting = confirmDeleteId === service.id;

            return (
              <div
                key={service.id}
                className={`p-5 rounded-xl bg-[#0d1117] border transition-all space-y-3 ${
                  service.isVisible !== false
                    ? 'border-white/[0.08]'
                    : 'border-white/[0.04] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                        #{service.editorialNumber || String(idx + 1).padStart(2, '0')}
                      </span>
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) => updateService(service.id, { title: e.target.value })}
                        className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden flex-1"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      Category: {service.category} · Icon: {service.iconName || 'Briefcase'}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Reorder Buttons */}
                    <button
                      onClick={() => handleMoveService(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveService(idx, 'down')}
                      disabled={idx === services.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Visibility */}
                    <button
                      onClick={() =>
                        updateService(service.id, { isVisible: service.isVisible === false })
                      }
                      title={service.isVisible !== false ? 'Visible' : 'Hidden'}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        service.isVisible !== false
                          ? 'text-sky-400 hover:bg-sky-500/10'
                          : 'text-slate-500 hover:bg-white/[0.05]'
                      }`}
                    >
                      {service.isVisible !== false ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                        <span className="text-[10px] text-rose-300">Delete?</span>
                        <button
                          onClick={() => {
                            deleteService(service.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-xs text-rose-400 hover:text-rose-200 font-bold cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(service.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={service.description}
                    onChange={(e) => updateService(service.id, { description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
                  />
                </div>

                {/* Features & Deliverables List with Add/Remove */}
                <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Deliverables & Features
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(service.features || []).map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1.5"
                      >
                        <span>✓ {f}</span>
                        <button
                          onClick={() =>
                            handleRemoveFeatureFromService(service.id, service.features, fIdx)
                          }
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add feature input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add deliverable bullet (e.g. End-to-end API integration)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget.value || '').trim();
                          if (val) {
                            handleAddNewFeature(service.id, service.features, val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">Press Enter</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  function handleAddNewFeature(serviceId: string, features: string[] = [], text: string) {
    if (!text.trim()) return;
    updateService(serviceId, {
      features: [...features, text.trim()]
    });
  }
};
