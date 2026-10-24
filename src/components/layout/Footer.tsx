import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PlatformIcon } from '../common/PlatformIcon';
import { ArrowUp, RotateCcw, Mail, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, replayIntro, setIsStudioRoute } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudio = () => {
    setIsStudioRoute(true);
    window.location.hash = '#studio';
  };

  return (
    <footer className="py-16 border-t border-white/[0.08] bg-[#090b10] relative text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/[0.06]">
          {/* Brand & Brief Statement */}
          <div className="md:col-span-6 space-y-4">
            <a
              href="#home"
              className="text-xl font-bold tracking-tight text-white hover:text-amber-300 transition-colors inline-block"
            >
              <span className="font-heading">{data.personal.fullName}</span>
            </a>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {data.footer.brandStatement}
            </p>
          </div>

          {/* Quick Nav Links */}
          {data.footer.showQuickLinks !== false && (
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Quick Navigation
              </div>
              <div className="flex flex-col space-y-2 text-xs">
                <a href="#about" className="hover:text-white transition-colors">About Background</a>
                <a href="#skills" className="hover:text-white transition-colors">Technical Skills</a>
                <a href="#services" className="hover:text-white transition-colors">Offered Services</a>
                <a href="#projects" className="hover:text-white transition-colors">Selected Projects</a>
                <a href="#experience" className="hover:text-white transition-colors">Experience Timeline</a>
                <a href="#contact" className="hover:text-white transition-colors">Contact / Hire</a>
              </div>
            </div>
          )}

          {/* Socials & Actions */}
          {data.footer.showSocials !== false && (
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Connectivity
              </div>
              <div className="flex flex-col space-y-2 text-xs">
                {data.personal.socials && data.personal.socials.length > 0 ? (
                  data.personal.socials.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <PlatformIcon platformOrIcon={soc.name || soc.icon} className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span>{soc.name}</span>
                    </a>
                  ))
                ) : (
                  <a
                    href={data.personal.email ? `mailto:${data.personal.email}` : '#'}
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{data.personal.email}</span>
                  </a>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={replayIntro}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Watch opening introduction animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Intro Animation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Copyright & Back-to-Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>{data.footer.copyrightText}</span>
            <button
              onClick={handleOpenStudio}
              aria-label="Studio Access"
              className="opacity-30 hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-sky-400 cursor-pointer"
              title="Studio Access"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>

          {data.footer.showBackToTop && (
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
