import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { DashboardTab } from '../../types/dashboard';
import {
  Globe,
  FileEdit,
  History,
  Image as ImageIcon,
  Folder,
  Briefcase,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Save,
  Send,
  AlertCircle
} from 'lucide-react';

interface DashboardHomeProps {
  onNavigateToSection: (tab: DashboardTab) => void;
  onOpenPublish: () => void;
  onOpenVersions: () => void;
  onOpenPreview: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onNavigateToSection,
  onOpenPublish,
  onOpenVersions,
  onOpenPreview
}) => {
  const {
    draftData,
    publishedData,
    autosaveStatus,
    saveDraftManual,
    networkStatus
  } = usePortfolio();

  const isUnsaved = autosaveStatus === 'unsaved';
  const lastPublishedDate = publishedData?.lastUpdated
    ? new Date(publishedData.lastUpdated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not yet published';

  const lastSavedDate = draftData?.lastUpdated
    ? new Date(draftData.lastUpdated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Just now';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Welcome & Overview Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f141d] to-[#141b27] border border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-medium text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              Visual Studio CMS
            </span>
            <span className="text-xs text-slate-400">· Production Ready</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-heading">
            Portfolio Management Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Edit content sections, update project case studies, manage media assets, and publish verified updates.
          </p>
        </div>

        {/* Primary Action Button Group */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateToSection('home')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-xs"
          >
            <FileEdit className="w-4 h-4 text-sky-400" />
            <span>Edit Portfolio</span>
          </button>

          <button
            onClick={onOpenPreview}
            className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-slate-300" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => saveDraftManual()}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border cursor-pointer shadow-xs ${
              isUnsaved
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40 animate-pulse'
                : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/10'
            }`}
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isUnsaved ? 'Save Draft *' : 'Save Draft'}</span>
          </button>

          <button
            onClick={onOpenPublish}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Status Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Portfolio Status */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Portfolio Status</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-base font-bold text-white">Live Online</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Version v{publishedData?.version || 1} Published
          </div>
        </div>

        {/* Card 2: Draft Status */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Draft Status</span>
            {isUnsaved ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
            )}
          </div>
          <div className="text-base font-bold text-white pt-1">
            {isUnsaved ? 'Unsaved Edits' : 'Up to Date'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Last saved at {lastSavedDate}
          </div>
        </div>

        {/* Card 3: Published Timestamp */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Last Published</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xs font-semibold text-white pt-2 leading-tight">
            {lastPublishedDate}
          </div>
          <button
            onClick={onOpenVersions}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Version History</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Media Count */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Media Assets</span>
            <ImageIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-white pt-1">
            {draftData.media?.length || 0} Assets
          </div>
          <button
            onClick={() => onNavigateToSection('media')}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Media Vault</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content Counts Strip */}
      <div className="p-4 rounded-xl bg-[#0d1117] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-white">Active Portfolio Sections</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Folder className="w-3.5 h-3.5 text-sky-400" />
            <span>{draftData.projects?.length || 0} Projects</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>{draftData.skills?.length || 0} Skills</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>{draftData.services?.length || 0} Services</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{draftData.experience?.length || 0} Career Milestones</span>
          </div>
        </div>
      </div>

      {/* Quick Access Section Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-white">Jump to Section Editor</h3>
          <span className="text-xs text-slate-400">Click any card to edit that section</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Home */}
          <div
            onClick={() => onNavigateToSection('home')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                🏠 Home / Hero
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-all group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-400">
              Avatar photo, headline, roles, and call-to-action buttons.
            </p>
          </div>

          {/* About */}
          <div
            onClick={() => onNavigateToSection('about')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                👤 About & Bio
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-all group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-400">
              Short bio narrative, detailed background, and statistics.
            </p>
          </div>

          {/* Skills */}
          <div
            onClick={() => onNavigateToSection('skills')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                🛠 Skills
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {draftData.skills?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Technical proficiencies, categories, and percentage sliders.
            </p>
          </div>

          {/* Services */}
          <div
            onClick={() => onNavigateToSection('services')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                💼 Services
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {draftData.services?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Client service cards, descriptions, and deliverables.
            </p>
          </div>

          {/* Projects */}
          <div
            onClick={() => onNavigateToSection('projects')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                📁 Projects
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {draftData.projects?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Portfolio showcase cards, cover images, and live links.
            </p>
          </div>

          {/* Experience */}
          <div
            onClick={() => onNavigateToSection('experience')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                🧰 Experience
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {draftData.experience?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Work history, timeline periods, and key achievements.
            </p>
          </div>

          {/* Contact */}
          <div
            onClick={() => onNavigateToSection('contact')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                📩 Contact
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-all group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-400">
              Direct email, booking link, response time, and availability.
            </p>
          </div>

          {/* Social Links */}
          <div
            onClick={() => onNavigateToSection('socials')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                🔗 Social Links
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {draftData.personal?.socials?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              GitHub, LinkedIn, WhatsApp, Fiverr, and Behance profiles.
            </p>
          </div>

          {/* Settings */}
          <div
            onClick={() => onNavigateToSection('settings')}
            className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#121721] border border-white/[0.08] hover:border-sky-500/30 transition-all cursor-pointer group space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                ⚙️ Settings & Theme
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-all group-hover:translate-x-0.5" />
            </div>
            <p className="text-[11px] text-slate-400">
              Light/Dark theme toggle, intro animation, and SEO metadata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
