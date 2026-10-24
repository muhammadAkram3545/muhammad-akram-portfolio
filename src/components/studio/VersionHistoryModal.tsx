import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { versionService, VersionSummary } from '../../services/versionService';
import { VersionHistoryItem } from '../../types/backend';
import {
  History,
  X,
  RotateCcw,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  FileCode,
  Sparkles
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const { restoreVersion } = usePortfolio();
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [versionDetail, setVersionDetail] = useState<VersionHistoryItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [restoreConfirming, setRestoreConfirming] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const list = await versionService.listVersions();
      setVersions(list);
      if (list.length > 0 && !selectedVersionId) {
        setSelectedVersionId(list[0].id);
        loadDetail(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setSelectedVersionId(id);
    setDetailLoading(true);
    try {
      const detail = await versionService.getVersion(id);
      setVersionDetail(detail);
    } catch (err) {
      console.error('Failed to load version detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoring(true);
    try {
      const success = await restoreVersion(id);
      if (success) {
        setRestoreSuccess(`Version restored into working draft.`);
        setRestoreConfirming(null);
        setTimeout(() => {
          setRestoreSuccess(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Restore failed:', err);
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[80vh] bg-[#0c0f16] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Version History & Release Timeline</span>
                <span className="text-xs font-mono text-slate-500 font-normal">
                  ({versions.length} release points)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect historical published snapshots and restore to working draft without overwriting production directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Versions Timeline */}
          <div className="w-80 border-r border-white/10 bg-[#090b10]/50 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Loading release history...</span>
              </div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No versions recorded yet. Publish your portfolio to create your first release snapshot.
              </div>
            ) : (
              versions.map((v, idx) => {
                const isSelected = v.id === selectedVersionId;
                const isLatest = idx === 0;

                return (
                  <div
                    key={v.id}
                    onClick={() => loadDetail(v.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-sky-500/10 text-white'
                        : 'border-white/[0.08] bg-[#0f131a] hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold font-mono text-sky-300 truncate">
                        {v.versionLabel}
                      </span>
                      {isLatest && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-semibold">
                          Live Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {v.summary || 'Release snapshot'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{new Date(v.timestamp).toLocaleDateString()}</span>
                      <span>{v.stats?.projectsCount || 0} Projects</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Snapshot Detail & Restore Action */}
          <div className="flex-1 bg-[#0c0f16] p-6 flex flex-col justify-between overflow-y-auto">
            {detailLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Fetching snapshot details...</span>
              </div>
            ) : versionDetail ? (
              <div className="space-y-6">
                {/* Status Bar */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0f131a] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{versionDetail.versionLabel}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                        Version #{versionDetail.versionNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>{new Date(versionDetail.timestamp).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span>{versionDetail.author.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Restore Button */}
                  <div>
                    {restoreConfirming === versionDetail.id ? (
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                        <span className="text-[11px] text-rose-300 font-medium">Confirm restore?</span>
                        <button
                          onClick={() => handleRestore(versionDetail.id)}
                          disabled={restoring}
                          className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
                        >
                          {restoring ? 'Restoring...' : 'Yes, Restore'}
                        </button>
                        <button
                          onClick={() => setRestoreConfirming(null)}
                          className="px-2 py-1 rounded hover:bg-white/10 text-slate-400 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRestoreConfirming(versionDetail.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-sky-500/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore into Draft</span>
                      </button>
                    )}
                  </div>
                </div>

                {restoreSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{restoreSuccess}</span>
                  </div>
                )}

                {/* Release Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Release Notes & Summary
                  </label>
                  <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/10 text-xs text-slate-300 leading-relaxed font-sans">
                    {versionDetail.summary || 'Production release snapshot containing all verified content items.'}
                  </div>
                </div>

                {/* Snapshot Metrics */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Snapshot Structure
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#090b10] border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Sections</span>
                      <span className="text-base font-bold text-white font-mono">
                        {versionDetail.stats.sectionsCount}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#090b10] border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Showcase Projects</span>
                      <span className="text-base font-bold text-white font-mono">
                        {versionDetail.stats.projectsCount}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#090b10] border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Skills & Services</span>
                      <span className="text-base font-bold text-white font-mono">
                        {versionDetail.stats.skillsCount + versionDetail.stats.servicesCount}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#090b10] border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Media Assets</span>
                      <span className="text-base font-bold text-white font-mono">
                        {versionDetail.stats.mediaCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safety Guarantee Notice */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Restoring a historical release point loads its snapshot directly into your private Studio Working Draft. The live public website will not be affected until you inspect the draft and click Publish.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Select a version on the left to inspect snapshot details.
              </div>
            )}

            <div className="pt-4 border-t border-white/10 mt-6 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Immutable Release Registry v5.0</span>
              <button onClick={onClose} className="hover:text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
