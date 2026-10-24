import React, { useState } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { ExperienceItem } from '../../../types/portfolio';
import {
  Clock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Briefcase
} from 'lucide-react';

export const ExperienceSectionEditor: React.FC = () => {
  const {
    draftData,
    addExperience,
    updateExperience,
    deleteExperience,
    toggleSectionVisibility
  } = usePortfolio();

  const [newRole, setNewRole] = useState('');
  const [newType, setNewType] = useState('Full-Time / Lead');
  const [newPeriod, setNewPeriod] = useState('2024 — Present');
  const [newDesc, setNewDesc] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const experience = draftData.experience || [];
  const expSection = draftData.sections?.find((s) => s.type === 'experience');
  const isExpVisible = expSection ? expSection.isVisible !== false : true;

  const handleAddNewExperience = () => {
    if (!newRole.trim()) return;
    addExperience({
      role: newRole.trim(),
      type: newType.trim(),
      period: newPeriod.trim(),
      description: newDesc.trim() || `Professional engagement as ${newRole.trim()}.`,
      highlights: ['Architected scalable production features', 'Delivered end-to-end technical milestones'],
      isVisible: true,
      order: experience.length + 1
    });
    setNewRole('');
    setNewDesc('');
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === experience.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = experience[index];
    const target = experience[targetIndex];

    updateExperience(current.id, { order: target.order || targetIndex + 1 });
    updateExperience(target.id, { order: current.order || index + 1 });
  };

  const handleAddHighlight = (expId: string, currentHighlights: string[], text: string) => {
    if (!text.trim()) return;
    updateExperience(expId, {
      highlights: [...(currentHighlights || []), text.trim()]
    });
  };

  const handleRemoveHighlight = (expId: string, currentHighlights: string[], hIdx: number) => {
    const updated = [...(currentHighlights || [])];
    updated.splice(hIdx, 1);
    updateExperience(expId, { highlights: updated });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧰 Career Experience & Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your career progression, roles, milestone periods, and key achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expSection && (
            <button
              onClick={() => toggleSectionVisibility(expSection.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isExpVisible
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
              }`}
            >
              {isExpVisible ? (
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
            {experience.length} Milestones
          </div>
        </div>
      </div>

      {/* Card 1: Add Experience */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Add Career Milestone</h3>
            <p className="text-xs text-slate-400">Add a professional position or contract period</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Lead Full-Stack Architect"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Company / Engagement Type
            </label>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Independent Consultant / Studio"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Period / Timeline
            </label>
            <input
              type="text"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              placeholder="2024 — Present"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Overview
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Summary of responsibilities and technical leadership..."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.04]">
          <button
            onClick={handleAddNewExperience}
            disabled={!newRole.trim()}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {/* Card 2: Existing Experience */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white px-1">Career Timeline Milestones</h3>

        <div className="space-y-3">
          {experience.map((item, idx) => {
            const isDeleting = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl bg-[#0d1117] border transition-all space-y-3 ${
                  item.isVisible !== false
                    ? 'border-white/[0.08]'
                    : 'border-white/[0.04] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => updateExperience(item.id, { role: e.target.value })}
                      className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden w-full"
                    />
                    <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                      <input
                        type="text"
                        value={item.type}
                        onChange={(e) => updateExperience(item.id, { type: e.target.value })}
                        className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden"
                      />
                      <span>·</span>
                      <input
                        type="text"
                        value={item.period}
                        onChange={(e) => updateExperience(item.id, { period: e.target.value })}
                        className="text-sky-400 bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden font-bold"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Reorder */}
                    <button
                      onClick={() => handleMoveExperience(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveExperience(idx, 'down')}
                      disabled={idx === experience.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Visibility */}
                    <button
                      onClick={() =>
                        updateExperience(item.id, { isVisible: item.isVisible === false })
                      }
                      title={item.isVisible !== false ? 'Visible' : 'Hidden'}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        item.isVisible !== false
                          ? 'text-sky-400 hover:bg-sky-500/10'
                          : 'text-slate-500 hover:bg-white/[0.05]'
                      }`}
                    >
                      {item.isVisible !== false ? (
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
                            deleteExperience(item.id);
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
                        title="Delete Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Role Description
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateExperience(item.id, { description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
                  />
                </div>

                {/* Key Achievements Bullet List */}
                <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Key Highlights & Outcomes
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.highlights || []).map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1.5"
                      >
                        <span>✓ {h}</span>
                        <button
                          onClick={() => handleRemoveHighlight(item.id, item.highlights, hIdx)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add key achievement (e.g. Boosted core web vitals by 40%)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget.value || '').trim();
                          if (val) {
                            handleAddHighlight(item.id, item.highlights, val);
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
};
