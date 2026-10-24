import React, { useState } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { SkillItem } from '../../../types/portfolio';
import {
  Wrench,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X
} from 'lucide-react';

export const SkillsSectionEditor: React.FC = () => {
  const {
    draftData,
    addSkill,
    updateSkill,
    deleteSkill,
    toggleSectionVisibility
  } = usePortfolio();

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Web Development');
  const [newSkillPercentage, setNewSkillPercentage] = useState(85);
  const [newSkillIcon, setNewSkillIcon] = useState('Code');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  const skills = draftData.skills || [];
  const skillsSection = draftData.sections?.find((s) => s.type === 'skills');
  const isSkillsVisible = skillsSection ? skillsSection.isVisible !== false : true;

  const categories = [
    'Web Development',
    'CMS & Platforms',
    'UI/UX & Design',
    'Media & Motion',
    'AI & SEO'
  ];

  const iconOptions = ['Code', 'Layout', 'Palette', 'Terminal', 'Wrench', 'Sparkles', 'Globe', 'Database', 'Shield'];

  const handleAddNewSkill = () => {
    if (!newSkillName.trim()) return;
    const clampedPercentage = Math.min(100, Math.max(0, newSkillPercentage));
    addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiencyPercentage: clampedPercentage,
      iconName: newSkillIcon,
      isVisible: true,
      description: `${newSkillName.trim()} proficiency across production workflows.`,
      order: skills.length + 1
    });
    setNewSkillName('');
    setNewSkillPercentage(85);
  };

  const handleMoveSkill = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === skills.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = skills[index];
    const target = skills[targetIndex];

    updateSkill(current.id, { order: target.order || targetIndex + 1 });
    updateSkill(target.id, { order: current.order || index + 1 });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🛠 Skills & Competencies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your technical skill competencies, category groupings, and visual percentage indicators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {skillsSection && (
            <button
              onClick={() => toggleSectionVisibility(skillsSection.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isSkillsVisible
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
              }`}
            >
              {isSkillsVisible ? (
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
            {skills.length} Skills
          </div>
        </div>
      </div>

      {/* Card 1: Add New Skill */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Add New Skill Competency</h3>
            <p className="text-xs text-slate-400">Add a skill to your portfolio showcase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. React & TypeScript"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#161c26]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Icon Symbol
            </label>
            <select
              value={newSkillIcon}
              onChange={(e) => setNewSkillIcon(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon} className="bg-[#161c26]">
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-12 space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span>Proficiency Score</span>
              <div className="flex items-center gap-1.5 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newSkillPercentage}
                  onChange={(e) =>
                    setNewSkillPercentage(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))
                  }
                  className="w-16 px-2 py-0.5 rounded bg-[#161c26] border border-white/10 text-right text-sky-400 font-bold"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={newSkillPercentage}
              onChange={(e) => setNewSkillPercentage(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.04]">
          <button
            onClick={handleAddNewSkill}
            disabled={!newSkillName.trim()}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Skill</span>
          </button>
        </div>
      </div>

      {/* Card 2: Existing Skills List with Reorder & Controls */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white px-1">Active Skills List</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.map((skill, idx) => {
            const isDeleting = confirmDeleteId === skill.id;
            const isEditing = editingSkillId === skill.id;

            return (
              <div
                key={skill.id}
                className={`p-4 rounded-xl bg-[#0d1117] border transition-all space-y-3 ${
                  skill.isVisible !== false
                    ? 'border-white/[0.08]'
                    : 'border-white/[0.04] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white/[0.05] text-sky-400 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                        className="text-xs font-semibold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden w-full"
                      />
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {skill.category}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Reorder Up/Down */}
                    <button
                      onClick={() => handleMoveSkill(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSkill(idx, 'down')}
                      disabled={idx === skills.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Visibility */}
                    <button
                      onClick={() =>
                        updateSkill(skill.id, { isVisible: skill.isVisible === false })
                      }
                      title={skill.isVisible !== false ? 'Visible' : 'Hidden'}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        skill.isVisible !== false
                          ? 'text-sky-400 hover:bg-sky-500/10'
                          : 'text-slate-500 hover:bg-white/[0.05]'
                      }`}
                    >
                      {skill.isVisible !== false ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete with confirmation */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                        <span className="text-[10px] text-rose-300">Delete?</span>
                        <button
                          onClick={() => {
                            deleteSkill(skill.id);
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
                        onClick={() => setConfirmDeleteId(skill.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Percentage slider & input */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Proficiency Rating</span>
                    <span className="text-white font-semibold">
                      {skill.proficiencyPercentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.proficiencyPercentage}
                    onChange={(e) =>
                      updateSkill(skill.id, {
                        proficiencyPercentage: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0))
                      })
                    }
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
