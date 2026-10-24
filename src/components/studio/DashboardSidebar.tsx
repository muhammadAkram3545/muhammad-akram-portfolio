import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { DashboardTab } from '../../types/dashboard';
import {
  LayoutDashboard,
  Home,
  User,
  Wrench,
  Briefcase,
  Folder,
  Clock,
  Mail,
  Link as LinkIcon,
  Image as ImageIcon,
  Compass,
  AlignEndHorizontal,
  Settings,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  X
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: (data: any) => number | string | null;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const {
    draftData,
    updateData,
    setIsStudioRoute,
    logoutStudio,
    openMediaPicker
  } = usePortfolio();

  const isLightMode = draftData.theme?.preset === 'minimal-light';

  const toggleTheme = () => {
    const nextPreset = isLightMode ? 'obsidian' : 'minimal-light';
    updateData((prev) => ({
      ...prev,
      theme: { ...prev.theme, preset: nextPreset }
    }));
  };

  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'about',
      label: 'About',
      icon: User
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: Wrench,
      badgeCount: (d) => d.skills?.length || 0
    },
    {
      id: 'services',
      label: 'Services',
      icon: Briefcase,
      badgeCount: (d) => d.services?.length || 0
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      badgeCount: (d) => d.projects?.length || 0
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: Clock,
      badgeCount: (d) => d.experience?.length || 0
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Mail
    },
    {
      id: 'socials',
      label: 'Social Links',
      icon: LinkIcon,
      badgeCount: (d) => d.personal?.socials?.length || 0
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: ImageIcon,
      badgeCount: (d) => d.media?.length || 0
    },
    {
      id: 'navigation',
      label: 'Navigation',
      icon: Compass,
      badgeCount: (d) => d.navigation?.length || 0
    },
    {
      id: 'footer',
      label: 'Footer',
      icon: AlignEndHorizontal
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const handleNavClick = (tabId: DashboardTab) => {
    if (tabId === 'media') {
      // Also provide direct full media manager dialog access
      openMediaPicker(() => {}, 'all');
    }
    onSelectTab(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b0e14] border-r border-white/[0.08] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold font-mono text-sm shadow-sm">
            MA
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-tight">
              Muhammad Akram
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Portfolio Studio
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Studio Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = item.badgeCount ? item.badgeCount(draftData) : null;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-sky-500/15 text-white border border-sky-500/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[13px]">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {badge !== null && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-sky-500/30 text-sky-200'
                        : 'bg-white/[0.06] text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Utility Controls */}
      <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#080a0e]/60">
        {/* Theme mode quick switcher */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
            {isLightMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-sky-400" />
            )}
            Theme Mode
          </span>
          <button
            onClick={toggleTheme}
            aria-label="Switch theme mode"
            className="text-[11px] font-mono px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            {isLightMode ? '☀️ Light' : '🌑 Dark'}
          </button>
        </div>

        {/* View Public Live Site */}
        <button
          onClick={() => {
            setIsStudioRoute(false);
            window.location.hash = '';
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            View Public Site
          </span>
          <span className="text-[10px] font-mono text-slate-400">Live ↗</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => logoutStudio()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Studio</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Drawer Modal */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
