import React, { useState } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  User,
  Quote,
  Plus,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { MobileImageUploadField } from '../../common/MobileImageUploadField';

export const AboutSectionEditor: React.FC = () => {
  const { draftData, updateData, toggleSectionVisibility, openMediaPicker } = usePortfolio();
  const [newParagraph, setNewParagraph] = useState('');
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  const personal = draftData.personal || {
    shortBio: '',
    detailedBio: [],
    aboutSectionTitle: 'Bridging technical precision with aesthetic intuition.',
    aboutQuote: '',
    aboutQuoteAuthor: ''
  };

  const aboutSection = draftData.sections?.find((s) => s.type === 'about');
  const isAboutVisible = aboutSection ? aboutSection.isVisible !== false : true;

  const handleUpdatePersonal = (field: string, value: any) => {
    updateData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleAddParagraph = () => {
    if (!newParagraph.trim()) return;
    const current = personal.detailedBio || [];
    handleUpdatePersonal('detailedBio', [...current, newParagraph.trim()]);
    setNewParagraph('');
  };

  const handleRemoveParagraph = (index: number) => {
    const current = [...(personal.detailedBio || [])];
    current.splice(index, 1);
    handleUpdatePersonal('detailedBio', current);
    setConfirmDeleteIdx(null);
  };

  const handleUpdateParagraph = (index: number, val: string) => {
    const current = [...(personal.detailedBio || [])];
    current[index] = val;
    handleUpdatePersonal('detailedBio', current);
  };

  const handleMoveParagraph = (index: number, direction: 'up' | 'down') => {
    const current = [...(personal.detailedBio || [])];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === current.length - 1)
    ) {
      return;
    }
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    handleUpdatePersonal('detailedBio', current);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👤 About & Bio Narrative</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your biography narrative, detailed background paragraphs, and personal creative statement.
          </p>
        </div>

        {/* Visibility Toggle */}
        {aboutSection && (
          <button
            onClick={() => toggleSectionVisibility(aboutSection.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              isAboutVisible
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
            }`}
          >
            {isAboutVisible ? (
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

      {/* Card 1: Section Title & Short Bio */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Headline & Summary Bio</h3>
            <p className="text-xs text-slate-400">Main heading and introductory summary</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              About Section Main Heading
            </label>
            <input
              type="text"
              value={personal.aboutSectionTitle || ''}
              onChange={(e) => handleUpdatePersonal('aboutSectionTitle', e.target.value)}
              placeholder="Bridging technical precision with aesthetic intuition."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Executive Bio
            </label>
            <textarea
              rows={3}
              value={personal.shortBio || ''}
              onChange={(e) => handleUpdatePersonal('shortBio', e.target.value)}
              placeholder="Specializing in end-to-end digital solutions..."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Philosophy Quote & Attribution */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Philosophy Statement / Quote (Optional)</h3>
            <p className="text-xs text-slate-400">Highlighted quote block rendered at the top of the About section</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quote Text
            </label>
            <textarea
              rows={2}
              value={personal.aboutQuote || ''}
              onChange={(e) => handleUpdatePersonal('aboutQuote', e.target.value)}
              placeholder="e.g. Great software is not just functional; it is intentional in every pixel, millisecond, and line of code."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Author / Attribution
            </label>
            <input
              type="text"
              value={personal.aboutQuoteAuthor || ''}
              onChange={(e) => handleUpdatePersonal('aboutQuoteAuthor', e.target.value)}
              placeholder="Muhammad Akram"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 3: About Section Circular Profile Image */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs">
        <MobileImageUploadField
          label="About Section Circular Profile Image"
          description="Dedicated circular profile image displayed beside the About heading. Upload directly from your device or pick from the media vault. Stored independently from hero banner."
          value={personal.aboutImageUrl || ''}
          onChange={(url) => handleUpdatePersonal('aboutImageUrl', url)}
          onOpenVault={() =>
            openMediaPicker((media) => {
              handleUpdatePersonal('aboutImageUrl', media.url);
            }, 'image')
          }
          aspectRatio="square"
          placeholderText="e.g. /assets/images/... or https://..."
          allowClear={true}
        />
      </div>

      {/* Card 4: Detailed Story Paragraphs */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Narrative Story Paragraphs</h3>
              <p className="text-xs text-slate-400">Reorderable paragraphs detailing your journey and technical philosophy</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-md">
            {(personal.detailedBio || []).length} Paragraphs
          </span>
        </div>

        {/* Existing Paragraphs */}
        <div className="space-y-3 pt-1">
          {(personal.detailedBio || []).map((p: string, idx: number) => {
            const isDeleting = confirmDeleteIdx === idx;

            return (
              <div key={idx} className="p-3.5 rounded-xl bg-[#161c26] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="font-medium">Story Block</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Reorder Buttons */}
                    <button
                      onClick={() => handleMoveParagraph(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveParagraph(idx, 'down')}
                      disabled={idx === (personal.detailedBio || []).length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete with confirmation */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                        <span className="text-[10px] text-rose-300">Delete?</span>
                        <button
                          onClick={() => handleRemoveParagraph(idx)}
                          className="text-xs text-rose-400 hover:text-rose-200 font-bold"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteIdx(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteIdx(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete Paragraph"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={p}
                  onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
                />
              </div>
            );
          })}
        </div>

        {/* Add Paragraph */}
        <div className="pt-2 border-t border-white/[0.04] space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Add New Narrative Paragraph
          </label>
          <textarea
            rows={2}
            value={newParagraph}
            onChange={(e) => setNewParagraph(e.target.value)}
            placeholder="Type your background, philosophy, or journey..."
            className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAddParagraph}
              disabled={!newParagraph.trim()}
              className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Paragraph</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
