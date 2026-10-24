import React, { useState } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  Image as ImageIcon,
  User,
  Sparkles,
  MapPin,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Link as LinkIcon
} from 'lucide-react';
import { MobileImageUploadField } from '../../common/MobileImageUploadField';

export const HomeSectionEditor: React.FC = () => {
  const {
    draftData,
    updateData,
    openMediaPicker,
    toggleSectionVisibility
  } = usePortfolio();

  const [newRoleInput, setNewRoleInput] = useState('');

  const personal = draftData.personal || {
    fullName: '',
    firstName: '',
    lastName: '',
    headline: '',
    tagline: '',
    roles: [],
    avatarUrl: '',
    location: '',
    availabilityNote: '',
    isAvailableForWork: true,
    primaryButtonText: 'View My Work',
    primaryButtonLink: '#projects',
    secondaryButtonText: "Let's Work Together",
    secondaryButtonLink: '#contact',
    heroBackgroundImageUrl: ''
  };

  const heroSection = draftData.sections?.find((s) => s.type === 'hero');
  const isHeroVisible = heroSection ? heroSection.isVisible !== false : true;

  const handleUpdatePersonal = (field: string, value: any) => {
    updateData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleAddRole = () => {
    if (!newRoleInput.trim()) return;
    const currentRoles = personal.roles || [];
    handleUpdatePersonal('roles', [...currentRoles, newRoleInput.trim()]);
    setNewRoleInput('');
  };

  const handleRemoveRole = (index: number) => {
    const currentRoles = [...(personal.roles || [])];
    currentRoles.splice(index, 1);
    handleUpdatePersonal('roles', currentRoles);
  };

  const handleMoveRole = (index: number, direction: 'up' | 'down') => {
    const currentRoles = [...(personal.roles || [])];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === currentRoles.length - 1)
    ) {
      return;
    }
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = currentRoles[index];
    currentRoles[index] = currentRoles[target];
    currentRoles[target] = temp;
    handleUpdatePersonal('roles', currentRoles);
  };

  const handleChangeAvatar = () => {
    openMediaPicker((selected) => {
      handleUpdatePersonal('avatarUrl', selected.url);
    }, 'image');
  };

  const handleChangeHeroBg = () => {
    openMediaPicker((selected) => {
      handleUpdatePersonal('heroBackgroundImageUrl', selected.url);
    }, 'image');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏠 Home & Hero Banner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your opening headline, portrait photo, buttons, and rotating titles.
          </p>
        </div>

        {/* Hero Section Visibility Toggle */}
        {heroSection && (
          <button
            onClick={() => toggleSectionVisibility(heroSection.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              isHeroVisible
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
            }`}
          >
            {isHeroVisible ? (
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

      {/* Card 1: Profile Photo / Avatar */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs">
        <MobileImageUploadField
          label="Profile Photo / Portrait"
          description="Primary portrait shown prominently in the cinematic hero banner. Choose directly from mobile gallery or file system."
          value={personal.avatarUrl || ''}
          onChange={(url) => handleUpdatePersonal('avatarUrl', url)}
          onOpenVault={handleChangeAvatar}
          aspectRatio="portrait"
          placeholderText="/assets/images/hero_portrait.jpg"
        />
      </div>

      {/* Card 2: Hero Background Image */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs">
        <MobileImageUploadField
          label="Hero Full-Screen Background Image"
          description="Cinematic full-screen visual covering the Hero background area. Choose high-resolution photo from mobile gallery."
          value={personal.heroBackgroundImageUrl || ''}
          onChange={(url) => handleUpdatePersonal('heroBackgroundImageUrl', url)}
          onOpenVault={handleChangeHeroBg}
          aspectRatio="video"
          placeholderText="https://images.unsplash.com/... or /assets/images/hero_bg.jpg"
          allowClear={true}
        />
      </div>

      {/* Card 3: Full Name & Identity */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Display Name & Identity</h3>
            <p className="text-xs text-slate-400">Your name across hero banner and portfolio branding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Display Name
            </label>
            <input
              type="text"
              value={personal.fullName || ''}
              onChange={(e) => handleUpdatePersonal('fullName', e.target.value)}
              placeholder="Muhammad Akram"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={personal.firstName || ''}
              onChange={(e) => handleUpdatePersonal('firstName', e.target.value)}
              placeholder="Muhammad"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={personal.lastName || ''}
              onChange={(e) => handleUpdatePersonal('lastName', e.target.value)}
              placeholder="Akram"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 4: Rotating Professional Titles */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Rotating Professional Titles</h3>
            <p className="text-xs text-slate-400">Titles that animate and cycle in the hero headline</p>
          </div>
        </div>

        {/* Existing Roles list with Reorder */}
        <div className="space-y-2 pt-1">
          {(personal.roles || []).map((role: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#161c26] border border-white/10 text-xs text-slate-200"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[11px] font-mono text-slate-500 w-5">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => {
                    const updated = [...(personal.roles || [])];
                    updated[idx] = e.target.value;
                    handleUpdatePersonal('roles', updated);
                  }}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-sky-400 focus:outline-hidden text-white font-medium flex-1 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMoveRole(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMoveRole(idx, 'down')}
                  disabled={idx === (personal.roles || []).length - 1}
                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRemoveRole(idx)}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                  title="Remove Title"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add role input */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
          <input
            type="text"
            value={newRoleInput}
            onChange={(e) => setNewRoleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
            placeholder="Add new title (e.g. AI Workflow Specialist)"
            className="flex-1 px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
          />
          <button
            onClick={handleAddRole}
            disabled={!newRoleInput.trim()}
            className="px-3.5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-50 text-white text-xs font-medium border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Add Title</span>
          </button>
        </div>
      </div>

      {/* Card 5: Headline & Tagline */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Headline & Tagline</h3>
          <p className="text-xs text-slate-400">Core value propositions displayed below your name</p>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Primary Headline
            </label>
            <textarea
              rows={2}
              value={personal.headline || ''}
              onChange={(e) => handleUpdatePersonal('headline', e.target.value)}
              placeholder="Multi-disciplinary digital creator bridging clean engineering, spatial design & intelligent interfaces."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Tagline
            </label>
            <input
              type="text"
              value={personal.tagline || ''}
              onChange={(e) => handleUpdatePersonal('tagline', e.target.value)}
              placeholder="Bridging modern code with visual craft."
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 6: Primary & Secondary Action Buttons */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Hero Call-to-Action Buttons</h3>
            <p className="text-xs text-slate-400">Customize labels and links for the primary and secondary hero buttons</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Primary Button */}
          <div className="p-3.5 rounded-xl bg-[#161c26] border border-white/10 space-y-2.5">
            <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Primary Action Button
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={personal.primaryButtonText || 'View My Work'}
                onChange={(e) => handleUpdatePersonal('primaryButtonText', e.target.value)}
                placeholder="View My Work"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Target Link / Anchor
              </label>
              <input
                type="text"
                value={personal.primaryButtonLink || '#projects'}
                onChange={(e) => handleUpdatePersonal('primaryButtonLink', e.target.value)}
                placeholder="#projects"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 font-mono"
              />
            </div>
          </div>

          {/* Secondary Button */}
          <div className="p-3.5 rounded-xl bg-[#161c26] border border-white/10 space-y-2.5">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Secondary Action Button
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={personal.secondaryButtonText || "Let's Work Together"}
                onChange={(e) => handleUpdatePersonal('secondaryButtonText', e.target.value)}
                placeholder="Let's Work Together"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Target Link / Anchor
              </label>
              <input
                type="text"
                value={personal.secondaryButtonLink || '#contact'}
                onChange={(e) => handleUpdatePersonal('secondaryButtonLink', e.target.value)}
                placeholder="#contact"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 7: Availability & Location */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Work Status & Location</h3>
            <p className="text-xs text-slate-400">Status pill shown above your name in hero banner</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Location Text
            </label>
            <input
              type="text"
              value={personal.location || ''}
              onChange={(e) => handleUpdatePersonal('location', e.target.value)}
              placeholder="Available Globally · Remote"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Availability Note
            </label>
            <input
              type="text"
              value={personal.availabilityNote || ''}
              onChange={(e) => handleUpdatePersonal('availabilityNote', e.target.value)}
              placeholder="Accepting select freelance contracts & full-time inquiries"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <span className="text-xs font-medium text-slate-300">
            Show "Available for Work" Green Indicator
          </span>
          <button
            onClick={() => handleUpdatePersonal('isAvailableForWork', !personal.isAvailableForWork)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              personal.isAvailableForWork ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                personal.isAvailableForWork ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
