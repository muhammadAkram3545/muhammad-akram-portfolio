import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import { MediaItem, MediaType } from '../../../types/portfolio';
import { mediaService } from '../../../services/mediaService';
import { PORTFOLIO_IMAGE_ACCEPT, uploadLocalFile } from '../../../utils/fileUploadHelper';
import {
  X,
  Upload,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (media: MediaItem) => void;
  filterType?: MediaType | 'all';
  selectionTitle?: string;
}

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  filterType = 'all',
  selectionTitle = 'Select Media Asset'
}) => {
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
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>(filterType);
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

  // Replace media dialog state
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceUrl, setReplaceUrl] = useState('');

  if (!isOpen) return null;

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
  }, [draftData.media, searchQuery, typeFilter, sortBy]);

  // Handle local file drop or selection (supporting multiple files)
  const handleLocalFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);

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
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isKnownType = file.type && allowedTypes.includes(file.type);
      const isKnownExt = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'mp4', 'webm', 'mp3', 'pdf'].includes(ext || '');

      if (!isKnownType && !isKnownExt) continue;
      if (file.size > 25 * 1024 * 1024) continue;

      try {
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
        try {
          uploadedItem = await mediaService.upload({
            dataUrl,
            filename: file.name,
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            mimeType: file.type || 'image/jpeg',
            altText: file.name.replace(/\.[^/.]+$/, '')
          });
        } catch (e) {
          console.warn('[MediaManagerModal] Server upload fallback to client:', e);
        }

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
      } catch (err) {
        console.error('[MediaManagerModal] File error:', err);
      }
    }

    setIsUploading(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[88vh] bg-[#0c0f16] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{selectionTitle}</span>
                <span className="text-xs font-mono text-slate-500 font-normal">
                  ({draftData.media.length} items in vault)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Centralized asset library with non-destructive replacement, metadata & live usage tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center p-1 bg-[#121620] rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Asset Library
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Add</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-2"
              title="Close Media Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Browse Assets */}
        {activeTab === 'browse' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Middle Main Grid / List */}
            <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
              {/* Filter Toolbar */}
              <div className="p-3 border-b border-white/10 bg-[#090b10]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search assets by filename, name, alt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-sky-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Media Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-slate-300 outline-none focus:border-sky-400"
                  >
                    <option value="all">All File Types</option>
                    <option value="image">Images Only</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documents</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-slate-300 outline-none focus:border-sky-400"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="oldest">Sort: Oldest</option>
                    <option value="name">Sort: Filename (A-Z)</option>
                    <option value="size">Sort: File Size</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-[#121620] rounded-lg border border-white/10 p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-2 py-1 rounded text-xs ${
                        viewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2 py-1 rounded text-xs ${
                        viewMode === 'list' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="List View"
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Container */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredMedia.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-white">No media items found</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      No assets match the current filter or search query. Upload high-res images or switch search terms.
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Upload New Asset
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {filteredMedia.map((media) => {
                      const isSelected = media.id === selectedMediaId;
                      const usage = getMediaUsage(media.id);

                      return (
                        <div
                          key={media.id}
                          onClick={() => setSelectedMediaId(media.id)}
                          onDoubleClick={() => {
                            if (onSelect) {
                              onSelect(media);
                              onClose();
                            }
                          }}
                          className={`group rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-400 ring-offset-2 ring-offset-[#0c0f16]'
                              : 'border-white/10 bg-[#0f131a] hover:border-white/20 hover:bg-[#121620]'
                          }`}
                        >
                          <div className="aspect-video w-full bg-[#080a0f] relative overflow-hidden flex items-center justify-center">
                            {media.mediaType === 'video' ? (
                              <Video className="w-8 h-8 text-sky-400" />
                            ) : media.mediaType === 'audio' ? (
                              <Music className="w-8 h-8 text-indigo-400" />
                            ) : media.mediaType === 'document' ? (
                              <FileText className="w-8 h-8 text-amber-400" />
                            ) : media.url && media.url.trim() ? (
                              <img
                                src={media.url.trim()}
                                alt={media.altText || media.alt || media.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-slate-600" />
                            )}

                            {/* Usage Badge */}
                            {usage.length > 0 && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-white font-mono text-[9px] border border-white/10">
                                {usage.length} {usage.length === 1 ? 'use' : 'uses'}
                              </span>
                            )}
                          </div>

                          <div className="p-2.5 text-left">
                            <div className="text-xs font-semibold text-white truncate" title={media.name}>
                              {media.name}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                              <span>{media.dimensions || media.fileSize || 'Standard'}</span>
                              <span className="capitalize text-slate-500">{media.mediaType || 'Image'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List View */
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10 bg-[#0f131a] text-xs">
                    {filteredMedia.map((media) => {
                      const isSelected = media.id === selectedMediaId;
                      const usage = getMediaUsage(media.id);

                      return (
                        <div
                          key={media.id}
                          onClick={() => setSelectedMediaId(media.id)}
                          onDoubleClick={() => {
                            if (onSelect) {
                              onSelect(media);
                              onClose();
                            }
                          }}
                          className={`p-3 flex items-center gap-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-500/10 text-white' : 'hover:bg-white/[0.03] text-slate-300'
                          }`}
                        >
                          <div className="w-12 h-10 rounded bg-[#080a0f] overflow-hidden shrink-0 flex items-center justify-center">
                            {media.mediaType === 'image' && media.url && media.url.trim() ? (
                              <img src={media.url.trim()} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-sky-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">{media.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{media.filename || media.url}</div>
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 w-24 truncate">
                            {media.dimensions || '—'}
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 w-20">
                            {media.fileSize || 'Standard'}
                          </div>

                          <div className="text-[11px] font-mono text-sky-400 w-16 text-right">
                            {usage.length > 0 ? `${usage.length} uses` : 'Unused'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Inspector & Details Sidebar */}
            <div className="w-80 bg-[#090b10] p-4 flex flex-col justify-between overflow-y-auto">
              {activeMedia ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                      Asset Details
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                      ID: {activeMedia.id.slice(-6)}
                    </span>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="aspect-video w-full rounded-xl bg-[#06080c] border border-white/10 overflow-hidden relative group flex items-center justify-center">
                    {activeMedia.url && activeMedia.url.trim() ? (
                      <img
                        src={activeMedia.url.trim()}
                        alt={activeMedia.altText || activeMedia.alt || activeMedia.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Open full resolution in new tab"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Editable Alt Text */}
                  <div className="space-y-1 text-xs">
                    <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>ACCESSIBILITY ALT TEXT</span>
                      <span className="text-[10px] text-sky-400">Recommended</span>
                    </label>
                    <textarea
                      rows={2}
                      value={activeMedia.altText || activeMedia.alt || ''}
                      onChange={(e) =>
                        updateMediaItem(activeMedia.id, {
                          altText: e.target.value,
                          alt: e.target.value
                        })
                      }
                      placeholder="Descriptive text for screen readers..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-white focus:border-sky-400 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Title / Name */}
                  <div className="space-y-1 text-xs">
                    <label className="text-[11px] font-mono text-slate-400">DISPLAY NAME</label>
                    <input
                      type="text"
                      value={activeMedia.name}
                      onChange={(e) => updateMediaItem(activeMedia.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-xs text-white focus:border-sky-400 outline-none"
                    />
                  </div>

                  {/* Structured Metadata Readout */}
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
                      <span className="text-slate-500">Source:</span>
                      <span className="text-sky-400 uppercase">{activeMedia.source || 'Local'}</span>
                    </div>
                  </div>

                  {/* Usage Reference Tracking */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-400 block">
                      LIVE USAGE REFERENCES ({activeUsageRefs.length})
                    </label>
                    {activeUsageRefs.length === 0 ? (
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-slate-500">
                        This asset is currently not linked to any section, project, or avatar.
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

                  {/* Replace Media Section */}
                  <div className="pt-2 border-t border-white/10">
                    {!isReplacing ? (
                      <button
                        onClick={() => setIsReplacing(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                        <span>Replace Media Everywhere</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-[#121620] border border-sky-400/30 space-y-2 text-xs">
                        <span className="text-[10px] font-mono text-sky-400 block font-bold">
                          REPLACE ASSET (PRESERVES ALL REFERENCES)
                        </span>
                        
                        {/* Direct Gallery Pick Option */}
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
                          placeholder="Paste new image URL..."
                          value={replaceUrl}
                          onChange={(e) => setReplaceUrl(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-[#090b10] border border-white/10 text-white text-xs outline-none focus:border-sky-400 font-mono"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleExecuteReplace}
                            disabled={!replaceUrl.trim()}
                            className="flex-1 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                          >
                            Swap URL
                          </button>
                          <button
                            onClick={() => setIsReplacing(false)}
                            className="px-2 py-1 rounded hover:bg-white/10 text-slate-400 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
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
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors"
                  >
                    {copyFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Asset URL</span>
                      </>
                    )}
                  </button>

                  {/* Delete Asset */}
                  {deleteWarning ? (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Used in {deleteWarning.count} places — replace/remove references first.</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        Deleting this asset will remove it from the projects or sections listed above. Force delete anyway?
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleDeleteActive(true)}
                          className="flex-1 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Force Delete
                        </button>
                        <button
                          onClick={() => setDeleteWarning(null)}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteActive(false)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 text-rose-400 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete from Vault</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                  <Info className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">Select any asset to inspect metadata, edit alt text, or replace references</p>
                </div>
              )}

              {/* Bottom Select Action Bar */}
              {onSelect && (
                <div className="pt-4 border-t border-white/10 mt-4">
                  <button
                    onClick={() => {
                      if (activeMedia) {
                        onSelect(activeMedia);
                        onClose();
                      }
                    }}
                    disabled={!activeMedia}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    Use Selected Asset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload & Add Assets */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 bg-[#090b10]">
            {/* Drag & Drop Local File Area */}
            <div className="flex-1 flex flex-col">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
                1. Local Drag & Drop Upload
              </span>

              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    handleLocalFiles(e.dataTransfer.files);
                  }
                }}
                className="flex-1 min-h-[260px] border-2 border-dashed border-white/20 hover:border-sky-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#0f131a] hover:bg-[#121620] group"
              >
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400 group-hover:scale-110 transition-transform mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Drop high-resolution images or media files here
                </p>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Supports JPG, PNG, WEBP, SVG, GIF, MP4, and PDF. Stored cleanly in Supabase Storage bucket portfolio-media.
                </p>
                <span className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-sm">
                  Choose from Mobile Gallery / Computer
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,audio/mpeg,application/pdf"
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
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Processing asset and extracting metadata...</span>
                </div>
              )}
            </div>

            {/* External URL Reference Form */}
            <div className="w-full md:w-96 flex flex-col">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
                2. Or Add from External URL
              </span>

              <form
                onSubmit={handleAddExternalUrl}
                className="p-5 rounded-2xl border border-white/10 bg-[#0f131a] space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    MEDIA URL *
                  </label>
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
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    ASSET TITLE / NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fintech Mobile App Mockup"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    ACCESSIBILITY ALT TEXT
                  </label>
                  <input
                    type="text"
                    placeholder="Describe image for screen readers"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    MEDIA CATEGORY
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#121620] border border-white/10 text-white text-xs focus:border-sky-400 outline-none"
                  >
                    <option value="image">Image (Photo/Illustration/Mockup)</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">PDF / Document</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!uploadUrl.trim()}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Add Asset to Vault
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
