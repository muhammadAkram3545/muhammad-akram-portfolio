import React, { useState } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { NavigationItem } from '../../../types/portfolio';
import {
  Compass,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const PREDEFINED_SECTIONS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
  { label: 'Custom External Link', href: 'custom' }
];

export const NavigationSectionEditor: React.FC = () => {
  const { draftData, addNavItem, updateNavItem, deleteNavItem } = usePortfolio();

  const [selectedPreset, setSelectedPreset] = useState('#home');
  const [newLabel, setNewLabel] = useState('Home');
  const [customHref, setCustomHref] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const navigation = draftData.navigation || [];

  const handleAddNewItem = () => {
    const finalHref = selectedPreset === 'custom' ? customHref.trim() : selectedPreset;
    if (!newLabel.trim() || !finalHref) return;

    addNavItem({
      label: newLabel.trim(),
      href: finalHref,
      isVisible: true,
      order: navigation.length + 1
    });

    setNewLabel('');
    setCustomHref('');
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === navigation.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = navigation[index];
    const targetItem = navigation[targetIndex];

    updateNavItem(currentItem.id, { order: targetItem.order || targetIndex + 1 });
    updateNavItem(targetItem.id, { order: currentItem.order || index + 1 });
  };

  const sortedNav = [...navigation].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧭 Header Navigation Menu</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure header links, reorder navigation items, and select section targets from a safe dropdown.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.06]">
          {navigation.length} Links
        </div>
      </div>

      {/* Card 1: Add Nav Item with Dropdown Target */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Add Header Navigation Link</h3>
            <p className="text-xs text-slate-400">Add an item to the top website navbar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Target Section
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value);
                const matched = PREDEFINED_SECTIONS.find((p) => p.href === e.target.value);
                if (matched && matched.href !== 'custom') {
                  setNewLabel(matched.label);
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
            >
              {PREDEFINED_SECTIONS.map((sec) => (
                <option key={sec.href} value={sec.href} className="bg-[#161c26]">
                  {sec.label} ({sec.href})
                </option>
              ))}
            </select>
          </div>

          <div className={selectedPreset === 'custom' ? 'sm:col-span-4' : 'sm:col-span-8'}>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Display Label in Menu
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Portfolio"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          {selectedPreset === 'custom' && (
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom URL / Anchor
              </label>
              <input
                type="text"
                value={customHref}
                onChange={(e) => setCustomHref(e.target.value)}
                placeholder="https://... or #section"
                className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 font-mono"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.04]">
          <button
            onClick={handleAddNewItem}
            disabled={!newLabel.trim()}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Navigation Item</span>
          </button>
        </div>
      </div>

      {/* Card 2: Existing Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white px-1">Active Menu Items</h3>

        <div className="space-y-2">
          {sortedNav.map((item, idx) => {
            const isDeleting = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#0d1117] border border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-mono text-slate-500 w-5">
                    {idx + 1}.
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                      className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden sm:w-44"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateNavItem(item.id, { href: e.target.value })}
                      className="text-xs font-mono text-slate-400 bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === sortedNav.length - 1}
                    title="Move Down"
                    className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility */}
                  <button
                    onClick={() =>
                      updateNavItem(item.id, { isVisible: item.isVisible === false })
                    }
                    title={item.isVisible !== false ? 'Visible' : 'Hidden'}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      item.isVisible !== false
                        ? 'text-sky-400 hover:bg-sky-500/10'
                        : 'text-slate-500 hover:bg-white/[0.05]'
                    }`}
                  >
                    {item.isVisible !== false ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Delete */}
                  {isDeleting ? (
                    <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                      <span className="text-[10px] text-rose-300">Delete?</span>
                      <button
                        onClick={() => {
                          deleteNavItem(item.id);
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
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Navigation Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
