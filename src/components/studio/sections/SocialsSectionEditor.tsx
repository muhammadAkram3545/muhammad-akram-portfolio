import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  validateSocialUrl,
  SocialValidationResult
} from '../../../utils/socialValidation';
import { PlatformIcon } from '../../common/PlatformIcon';

export const SocialsSectionEditor: React.FC = () => {
  const { draftData, updateData } = usePortfolio();

  const [selectedPlatform, setSelectedPlatform] = useState('LinkedIn');
  const [customName, setCustomName] = useState('');
  const [newUrl, setNewUrl] = useState('https://linkedin.com/in/');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const socials = draftData.personal?.socials || [];

  const validationResult = useMemo<SocialValidationResult>(() => {
    return validateSocialUrl(selectedPlatform, newUrl);
  }, [selectedPlatform, newUrl]);

  const handleUpdateSocials = (updated: any[]) => {
    updateData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        socials: updated
      }
    }));
  };

  const handleAddNewSocial = () => {
    if (!validationResult.isValid) return;

    const finalName = selectedPlatform === 'Custom Profile' ? customName.trim() || 'Profile' : selectedPlatform;
    const matched = SUPPORTED_SOCIAL_PLATFORMS.find((p) => p.name === selectedPlatform);

    const item = {
      id: `soc-${Date.now()}`,
      name: finalName,
      url: validationResult.normalizedUrl,
      icon: matched ? matched.icon : 'Link',
      isPrimary: false
    };

    handleUpdateSocials([...socials, item]);
    const nextPlatform = SUPPORTED_SOCIAL_PLATFORMS.find((p) => p.name === selectedPlatform);
    setNewUrl(nextPlatform ? nextPlatform.defaultPrefix : '');
    setCustomName('');
  };

  const handleDeleteSocial = (id: string) => {
    handleUpdateSocials(socials.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  const handleTogglePrimary = (id: string) => {
    handleUpdateSocials(
      socials.map((s) => (s.id === id ? { ...s, isPrimary: !s.isPrimary } : s))
    );
  };

  const handleMoveSocial = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === socials.length - 1)
    ) {
      return;
    }
    const target = direction === 'up' ? index - 1 : index + 1;
    const current = [...socials];
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    handleUpdateSocials(current);
  };

  const handleUpdateSocialField = (id: string, field: string, val: any) => {
    handleUpdateSocials(
      socials.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🔗 Social Links & Profiles</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your developer profiles, client studio links, and direct messaging channels.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.06]">
          {socials.length} Profiles
        </div>
      </div>

      {/* Card 1: Add Social */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Add Social Profile</h3>
            <p className="text-xs text-slate-400">Select a known platform or add a custom link</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Platform
            </label>
            <div className="relative">
              <select
                value={selectedPlatform}
                onChange={(e) => {
                  const platName = e.target.value;
                  setSelectedPlatform(platName);
                  const matched = SUPPORTED_SOCIAL_PLATFORMS.find((p) => p.name === platName);
                  if (matched) {
                    setNewUrl(matched.defaultPrefix);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 cursor-pointer"
              >
                {SUPPORTED_SOCIAL_PLATFORMS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-[#161c26]">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-2.5 top-2.5 pointer-events-none text-sky-400">
                <PlatformIcon platformOrIcon={selectedPlatform} className="w-4 h-4" />
              </div>
            </div>
          </div>

          {selectedPlatform === 'Custom Profile' && (
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Platform Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Dribbble or Substack"
                className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
              />
            </div>
          )}

          <div className={selectedPlatform === 'Custom Profile' ? 'sm:col-span-4' : 'sm:col-span-8'}>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Profile URL (Must match {selectedPlatform} domain)
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={
                SUPPORTED_SOCIAL_PLATFORMS.find((p) => p.name === selectedPlatform)?.placeholder || 'https://...'
              }
              className={`w-full px-3 py-2 rounded-lg bg-[#161c26] border text-xs text-white font-mono focus:outline-hidden transition-colors ${
                !newUrl.trim()
                  ? 'border-white/10 focus:border-sky-500/50'
                  : validationResult.isValid
                  ? 'border-emerald-500/50 focus:border-emerald-400'
                  : 'border-rose-500/60 focus:border-rose-400'
              }`}
            />
          </div>
        </div>

        {/* Real-Time Domain Validation Feedback */}
        {newUrl.trim() && (
          <div className="pt-2">
            {validationResult.isValid ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Valid {validationResult.platformName} URL verified: {validationResult.normalizedUrl}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationResult.errorMessage}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] text-slate-500">
            Note: Domain validation confirms link points to authentic platform, not ownership.
          </span>
          <button
            onClick={handleAddNewSocial}
            disabled={!validationResult.isValid}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Social Profile</span>
          </button>
        </div>
      </div>

      {/* Card 2: Existing Socials List with Reordering */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white px-1">Active Profiles</h3>

        <div className="space-y-3">
          {socials.map((s, idx) => {
            const isDeleting = confirmDeleteId === s.id;

            return (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-white/[0.05] text-sky-400 shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => handleUpdateSocialField(s.id, 'name', e.target.value)}
                        className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden"
                      />
                      {s.isPrimary && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={s.url}
                      onChange={(e) => handleUpdateSocialField(s.id, 'url', e.target.value)}
                      className="text-xs text-slate-400 bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden w-full font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reorder Up/Down */}
                  <button
                    onClick={() => handleMoveSocial(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveSocial(idx, 'down')}
                    disabled={idx === socials.length - 1}
                    className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Primary toggle */}
                  <button
                    onClick={() => handleTogglePrimary(s.id)}
                    title={s.isPrimary ? 'Unmark Primary' : 'Set as Primary'}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      s.isPrimary
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-slate-500 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  {/* Visit link */}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.05]"
                    title="Open URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Delete */}
                  {isDeleting ? (
                    <div className="flex items-center gap-1 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                      <span className="text-[10px] text-rose-300">Delete?</span>
                      <button
                        onClick={() => handleDeleteSocial(s.id)}
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
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Social Profile"
                    >
                      <Trash2 className="w-4 h-4" />
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
