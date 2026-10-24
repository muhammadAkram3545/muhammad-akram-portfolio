import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { MediaItem, MediaType } from '../../../types/portfolio';
import { mediaService } from '../../../services/mediaService';
import { PORTFOLIO_IMAGE_ACCEPT, uploadLocalFile } from '../../../utils/fileUploadHelper';
import {
  Upload,
  Search,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Video,
  FileText,
  AlertTriangle,
  Info,
  Maximize2,
  FolderOpen,
  Plus,
  ShieldAlert
} from 'lucide-react';

export const MediaLibrarySection: React.FC = () => {
  const {
    draftData,
    addMediaItem,
    updateMediaItem,
    safeDeleteMedia,
    replaceMedia,
    getMediaUsage
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'in_use' | 'unused'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<{ id: string; count: number } | null>(null);

  // Upload tab state
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadType, setUploadType] = useState<MediaType>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Replace media dialog state
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceUrl, setReplaceUrl] = useState('');

  // Selected media object
  const activeMedia = draftData.media.find((m) => m.id === selectedMediaId);
  const activeUsageRefs = activeMedia ? getMediaUsage(activeMedia.id) : [];

  // Filtered & Sorted Media items
  const filteredMedia = useMemo(() => {
    return draftData.media
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchAlt = (item.altText || item.alt || '').toLowerCase().includes(q);
          const matchFile = (item.filename || '').toLowerCase().includes(q);
          if (!matchName && !matchAlt && !matchFile) return false;
        }
        // Type filter
        if (typeFilter !== 'all') {
          if (item.mediaType !== typeFilter) return false;
        }
        // Usage filter
        if (usageFilter !== 'all') {
          const refs = getMediaUsage(item.id);
          if (usageFilter === 'in_use' && refs.length === 0) return false;
          if (usageFilter === 'unused' && refs.length > 0) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'size') {
          return (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
        }
        return 0;
      });
  }, [draftData.media, searchQuery, typeFilter, usageFilter, sortBy, getMediaUsage]);

  // Handle local file drop or selection (supporting multiple files)
  const handleLocalFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'application/pdf'
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressText(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

      // 1. Type validation
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isKnownType = file.type && allowedTypes.includes(file.type);
      const isKnownExt = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'mp4', 'webm', 'mp3', 'pdf'].includes(ext || '');

      if (!isKnownType && !isKnownExt) {
        setUploadError(`Skipped "${file.name}": Unsupported format. Allowed: JPG, PNG, WEBP, SVG, GIF, MP4, PDF.`);
        continue;
      }

      // 2. Size validation (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`Skipped "${file.name}": Exceeds maximum 25MB limit.`);
        continue;
      }

      try {
        // Read to base64 Data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const isVideo = ['mp4', 'webm'].includes(ext || '');
        const isAudio = ['mp3', 'wav'].includes(ext || '');
        const isDoc = ['pdf'].includes(ext || '');
        const mediaType: MediaType = isVideo ? 'video' : isAudio ? 'audio' : isDoc ? 'document' : 'image';

        const kb = Math.round(file.size / 1024);
        const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

        let uploadedItem: MediaItem | null = null;

        // Attempt server upload directly to Supabase Storage bucket
        try {
          uploadedItem = await mediaService.upload({
            dataUrl,
            filename: file.name,
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            mimeType: file.type || 'image/jpeg',
            altText: file.name.replace(/\.[^/.]+$/, ''),
            description: `Uploaded from admin studio`
          });
        } catch (serverErr) {
          console.warn('[MediaLibrary] Server upload fallback to client vault:', serverErr);
        }

        // Fallback / local registration
        if (uploadedItem) {
          addMediaItem(uploadedItem);
          setSelectedMediaId(uploadedItem.id);
        } else {
          const item = addMediaItem({
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            filename: file.name,
            originalFilename: file.name,
            url: dataUrl,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            altText: file.name.replace(/\.[^/.]+$/, ''),
            mediaType,
            mimeType: file.type || 'image/jpeg',
            fileSize: sizeStr,
            fileSizeBytes: file.size,
            source: 'upload'
          });
          setSelectedMediaId(item.id);
        }
      } catch (err: any) {
        console.error('[MediaLibrary] Upload error:', err);
        setUploadError(`Failed to process "${file.name}": ${err.message || 'Unknown error'}`);
      }
    }

    setIsUploading(false);
    setUploadProgressText('');
    setActiveTab('browse');
  };

  // Add external URL asset
  const handleAddExternalUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    const item = addMediaItem({
      name: uploadName.trim() || 'External Media',
      url: uploadUrl.trim(),
      alt: uploadAlt.trim() || uploadName.trim() || 'Media Asset',
      altText: uploadAlt.trim() || uploadName.trim() || 'Media Asset',
      mediaType: uploadType,
      fileSize: 'External URL',
      source: 'external-url'
    });

    setSelectedMediaId(item.id);
    setUploadUrl('');
    setUploadName('');
    setUploadAlt('');
    setActiveTab('browse');
  };

  const handleExecuteReplace = () => {
    if (!activeMedia || !replaceUrl.trim()) return;
    replaceMedia(activeMedia.id, {
      url: replaceUrl.trim(),
      updatedAt: new Date().toISOString()
    });
    setReplaceUrl('');
    setIsReplacing(false);
  };

  const handleDeleteActive = (force: boolean = false) => {
    if (!activeMedia) return;
    const res = safeDeleteMedia(activeMedia.id, force);
    if (!res.success) {
      setDeleteWarning({ id: activeMedia.id, count: res.usageCount });
    } else {
      setDeleteWarning(null);
      setSelectedMediaId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🖼 Media Library & Asset Vault</span>
            <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/[0.06]">
              {draftData.media.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage, upload, inspect, replace, and safely organize all portfolio media backed by Supabase Storage.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-[#121620] rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Asset Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Add</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tab 1: Browse Assets */}
      {activeTab === 'browse' && (
        <div className="rounded-2xl bg-[#0d1117] border border-white/[0.08] overflow-hidden flex flex-col lg:flex-row h-[750px]">
          {/* Main Media Grid / List */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 border-b border-white/10 bg-[#090b10]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, filename, alt text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-sky-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-slate-300 outline-none focus:border-sky-400"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images Only</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                </select>

                {/* Usage Filter */}
                <select
                  value={usageFilter}
                  onChange={(e) => setUsageFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-slate-300 outline-none focus:border-sky-400"
                >
                  <option value="all">All Usage</option>
                  <option value="in_use">In Use Only</option>
                  <option value="unused">Unused</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-slate-300 outline-none focus:border-sky-400"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="size">Sort: File Size</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center bg-[#121620] rounded-lg border border-white/10 p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Media Items Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMedia.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-white">No media items found</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    No assets match your search or filter. Upload images to populate your library.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Upload Images
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredMedia.map((item) => {
                    const isSelected = item.id === selectedMediaId;
                    const usageCount = getMediaUsage(item.id).length;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedMediaId(item.id);
                          setDeleteWarning(null);
                        }}
                        className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all bg-[#121620] flex flex-col ${
                          isSelected
                            ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-lg shadow-sky-500/10'
                            : 'border-white/10 hover:border-white/20 hover:bg-[#161c28]'
                        }`}
                      >
                        {/* Thumbnail Container */}
                        <div className="aspect-square bg-[#090b10] relative overflow-hidden flex items-center justify-center">
                          {item.mediaType === 'image' || (!item.mediaType && !item.url.endsWith('.pdf')) ? (
                            <img
                              src={item.url}
                              alt={item.alt || item.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : item.mediaType === 'video' ? (
                            <div className="flex flex-col items-center text-slate-400">
                              <Video className="w-8 h-8 text-sky-400 mb-1" />
                              <span className="text-[10px] font-mono">Video Asset</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-slate-400">
                              <FileText className="w-8 h-8 text-amber-400 mb-1" />
                              <span className="text-[10px] font-mono">Document</span>
                            </div>
                          )}

                          {/* Usage Badge */}
                          {usageCount > 0 && (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#090b10]/80 backdrop-blur-xs border border-white/10 text-[9px] font-mono text-sky-400">
                              Used in {usageCount}
                            </span>
                          )}
                        </div>

                        {/* Title bar */}
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                            <span>{item.fileSize || 'Asset'}</span>
                            <span className="text-slate-500 uppercase">{item.mediaType || 'img'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-1.5">
                  {filteredMedia.map((item) => {
                    const isSelected = item.id === selectedMediaId;
                    const usageCount = getMediaUsage(item.id).length;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedMediaId(item.id);
                          setDeleteWarning(null);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-500/10 border-sky-400 text-white'
                            : 'bg-[#121620] border-white/10 hover:border-white/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#090b10] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                            {item.mediaType === 'image' || (!item.mediaType && !item.url.endsWith('.pdf')) ? (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{item.filename || item.url}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
                          <span>{item.fileSize || 'Standard'}</span>
                          {usageCount > 0 ? (
                            <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded text-[10px]">
                              In use ({usageCount})
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Unused</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Inspector Panel */}
          <div className="w-full lg:w-84 bg-[#090b10] p-4 flex flex-col justify-between overflow-y-auto">
            {activeMedia ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
                    Asset Details
                  </h3>
                  {/* Large Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 mb-2">
                    <img
                      src={activeMedia.url}
                      alt={activeMedia.alt || activeMedia.name}
                      className="w-full h-full object-contain"
                    />
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white"
                      title="Open full image"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Display Name</label>
                  <input
                    type="text"
                    value={activeMedia.name}
                    onChange={(e) => updateMediaItem(activeMedia.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-white focus:border-sky-400 outline-none"
                  />
                </div>

                {/* Alt Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Alt Text (Accessibility)</label>
                  <textarea
                    rows={2}
                    value={activeMedia.altText || activeMedia.alt || ''}
                    onChange={(e) =>
                      updateMediaItem(activeMedia.id, {
                        altText: e.target.value,
                        alt: e.target.value
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-white focus:border-sky-400 outline-none resize-none"
                  />
                </div>

                {/* Metadata */}
                <div className="p-3 rounded-xl bg-[#121620] border border-white/10 space-y-1.5 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">MIME Type:</span>
                    <span className="text-white">{activeMedia.mimeType || 'image/jpeg'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dimensions:</span>
                    <span className="text-white">{activeMedia.dimensions || '1920x1080'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">File Size:</span>
                    <span className="text-white">{activeMedia.fileSize || 'Standard'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Storage:</span>
                    <span className="text-sky-400 uppercase">portfolio-media</span>
                  </div>
                </div>

                {/* Live Usage Tracking */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-400 block">
                    Portfolio References ({activeUsageRefs.length})
                  </label>
                  {activeUsageRefs.length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-slate-500">
                      Not currently assigned to any project, hero, or section. Safe to delete.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {activeUsageRefs.map((ref, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded bg-white/[0.04] border border-white/5 text-[11px] flex items-center justify-between text-slate-300"
                        >
                          <span className="truncate">{ref.entityTitle}</span>
                          <span className="text-[9px] font-mono text-sky-400 shrink-0 ml-2">
                            {ref.field}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Copy URL */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeMedia.url);
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Public URL</span>
                    </>
                  )}
                </button>

                {/* Replace Media Everywhere */}
                <div>
                  {!isReplacing ? (
                    <button
                      onClick={() => setIsReplacing(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Replace Media Everywhere</span>
                    </button>
                  ) : (
                      <div className="p-2.5 rounded-xl bg-[#121620] border border-sky-400/30 space-y-2 text-xs">
                        <span className="text-[10px] font-mono text-sky-400 block font-bold">
                          REPLACE ASSET (PRESERVES ALL REFERENCES)
                        </span>

                        {/* Direct Gallery Selection */}
                        <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose New Photo from Gallery</span>
                          <input
                            type="file"
                            accept={PORTFOLIO_IMAGE_ACCEPT}
                            onClick={(e) => {
                              (e.target as HTMLInputElement).value = '';
                            }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && activeMedia) {
                                try {
                                  const result = await uploadLocalFile(file, {
                                    name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                                    altText: file.name
                                  });
                                  replaceMedia(activeMedia.id, {
                                    url: result.url,
                                    filename: result.filename,
                                    mimeType: result.mimeType,
                                    updatedAt: new Date().toISOString()
                                  });
                                  setIsReplacing(false);
                                } catch (err) {
                                  console.error('Failed to replace with gallery image:', err);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-[1px] flex-1 bg-white/10" />
                          <span className="text-[9px] font-mono text-slate-500">OR PASTE URL</span>
                          <div className="h-[1px] flex-1 bg-white/10" />
                        </div>

                        <input
                          type="text"
                          placeholder="Paste replacement image URL..."
                          value={replaceUrl}
                          onChange={(e) => setReplaceUrl(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-[#090b10] border border-white/10 text-white text-xs outline-none focus:border-sky-400 font-mono"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleExecuteReplace}
                            disabled={!replaceUrl.trim()}
                            className="flex-1 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Swap URL
                          </button>
                          <button
                            onClick={() => setIsReplacing(false)}
                            className="px-2 py-1 rounded hover:bg-white/10 text-slate-400 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                </div>

                {/* Safe Deletion */}
                {deleteWarning ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Used in {deleteWarning.count} places — replace/remove references first.</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Deleting this media file now will break references in the projects/sections shown above.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleDeleteActive(true)}
                        className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Force Delete & Unlink
                      </button>
                      <button
                        onClick={() => setDeleteWarning(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteActive(false)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Media Asset</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Info className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Select any asset to inspect metadata, edit alt text, or replace references</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Upload New Media */}
      {activeTab === 'upload' && (
        <div className="p-6 rounded-2xl bg-[#0d1117] border border-white/[0.08] flex flex-col md:flex-row gap-6">
          {/* Drag & Drop Local Upload Area */}
          <div className="flex-1 flex flex-col">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
              1. Upload Images from Device (Supabase Storage)
            </span>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  handleLocalFiles(e.dataTransfer.files);
                }
              }}
              className="flex-1 min-h-[280px] border-2 border-dashed border-white/20 hover:border-sky-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#090b10] hover:bg-[#0f131a] group"
            >
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400 group-hover:scale-110 transition-transform mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Drag & Drop Images or Project Screenshots Here
              </p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supports multiple files: JPG, PNG, WEBP, SVG, GIF, MP4, and PDF. Directly saved to Supabase Storage bucket <code className="text-sky-300">portfolio-media</code>.
              </p>
              <span className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-sm">
                Choose from Mobile Gallery / Device
              </span>
              <input
                type="file"
                multiple
                accept={PORTFOLIO_IMAGE_ACCEPT}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = '';
                }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleLocalFiles(e.target.files);
                  }
                }}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                <span>{uploadProgressText || 'Uploading to Supabase Storage bucket...'}</span>
              </div>
            )}
          </div>

          {/* External URL Reference */}
          <div className="w-full md:w-96 flex flex-col">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
              2. Or Add from External Image URL
            </span>

            <form
              onSubmit={handleAddExternalUrl}
              className="p-5 rounded-2xl border border-white/10 bg-[#090b10] space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">IMAGE URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white font-mono text-xs focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">ASSET NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Web Dashboard UI"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">ACCESSIBILITY ALT TEXT</label>
                <input
                  type="text"
                  placeholder="Description for screen readers"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">MEDIA CATEGORY</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                >
                  <option value="image">Image (Photo/Illustration/Mockup)</option>
                  <option value="video">Video</option>
                  <option value="document">PDF Document</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!uploadUrl.trim()}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Add External Asset
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
