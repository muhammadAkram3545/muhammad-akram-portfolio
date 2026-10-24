import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { validatePortfolioForPublish } from '../../server/validation/validator';
import {
  CheckCircle2,
  Globe,
  AlertTriangle,
  ArrowRight,
  X,
  ShieldAlert,
  Sparkles,
  FileText,
  RefreshCw
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const { draftData, publishedData, publishDraft, setIsStudioRoute } = usePortfolio();
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Run instant pre-publish validation
  const validation = useMemo(() => {
    return validatePortfolioForPublish(draftData);
  }, [draftData]);

  if (!isOpen) return null;

  const handleConfirmPublish = async () => {
    if (!validation.isValid) return;

    setIsPublishing(true);
    setPublishError(null);

    try {
      const success = await publishDraft(releaseNotes.trim() || undefined);
      if (success) {
        setPublishedSuccess(true);
        setTimeout(() => {
          setPublishedSuccess(false);
          onClose();
        }, 2500);
      } else {
        setPublishError('Failed to publish changes. Please retry.');
      }
    } catch (err: any) {
      setPublishError(err.message || 'Server error occurred during publish.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleViewLive = () => {
    onClose();
    setIsStudioRoute(false);
    if (window.location.hash.includes('studio') || window.location.hash.includes('admin')) {
      window.location.hash = '';
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  const nextVersionNum = (publishedData.version || 1) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl p-6 text-[#f0f4f8]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {publishedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Successfully Published to Live Production!
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Version #{nextVersionNum} has been registered to immutable history. Public visitors are now seeing your latest content.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleViewLive}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <Globe className="w-4 h-4" />
                <span>View Live Portfolio Website</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Publish to Live Portfolio
                </h3>
                <div className="text-[11px] text-slate-400 font-mono">
                  Target Release: Version #{nextVersionNum} · Snapshot will be archived
                </div>
              </div>
            </div>

            {/* Validation Feedback */}
            {!validation.isValid ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Publish Blocked: Critical Errors Found</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-200">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : validation.warnings.length > 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Validation Passed with Warnings</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-200">
                  {validation.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All mandatory sections, identity fields, and media references verified.</span>
              </div>
            )}

            {publishError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {publishError}
              </div>
            )}

            {/* Release Notes Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">
                RELEASE NOTES / SUMMARY (OPTIONAL)
              </label>
              <textarea
                rows={2}
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="e.g. Added new AI projects, refined skills list and updated theme tokens."
                className="w-full px-3 py-2 bg-[#090b10] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-sky-400 resize-none leading-relaxed"
              />
            </div>

            {/* Verification Breakdown */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#090b10] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Active Sections:</span>
                <span className="text-white font-mono">
                  {validation.stats.activeSections} / {draftData.sections.length}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Showcase Projects:</span>
                <span className="text-white font-mono">{validation.stats.activeProjects}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vault Media Assets:</span>
                <span className="text-white font-mono">{validation.stats.mediaItems}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Theme Preset:</span>
                <span className="text-sky-400 font-mono capitalize">{draftData.theme.preset}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                className="flex-1 py-2.5 px-3 text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Keep in Draft
              </button>

              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={!validation.isValid || isPublishing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 rounded-xl transition-colors cursor-pointer shadow-sm shadow-sky-500/25"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing & Archiving...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Publish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
