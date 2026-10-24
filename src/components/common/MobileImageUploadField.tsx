import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { uploadLocalFile, PORTFOLIO_IMAGE_ACCEPT } from '../../utils/fileUploadHelper';
import { usePortfolio } from '../../context/PortfolioContext';

export interface MobileImageUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  onOpenVault?: () => void;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  previewHeightClass?: string;
  placeholderText?: string;
  allowClear?: boolean;
  className?: string;
}

export const MobileImageUploadField: React.FC<MobileImageUploadFieldProps> = ({
  label,
  description,
  value,
  onChange,
  onOpenVault,
  aspectRatio = 'auto',
  previewHeightClass = 'h-24 sm:h-28',
  placeholderText = 'e.g. /assets/images/... or https://...',
  allowClear = true,
  className = ''
}) => {
  const { addMediaItem } = usePortfolio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState<string>(value || '');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Sync manual URL when value prop changes externally
  React.useEffect(() => {
    setManualUrl(value || '');
  }, [value]);

  const handleTriggerPicker = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      // Reset input value so selecting the same photo twice still triggers onChange
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadStatus('Reading from gallery...');

    try {
      const result = await uploadLocalFile(file, {
        name: label,
        altText: `${label} image`,
        onProgress: (_percent, statusText) => {
          setUploadStatus(statusText);
        }
      });

      // Update parent value
      onChange(result.url);
      setManualUrl(result.url);

      // If registered to media vault or fallback, ensure in context
      if (result.mediaItem) {
        addMediaItem(result.mediaItem);
      } else {
        addMediaItem({
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          filename: file.name,
          originalFilename: file.name,
          url: result.url,
          alt: file.name,
          altText: file.name,
          mediaType: 'image',
          mimeType: result.mimeType,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileSizeBytes: file.size,
          source: 'upload'
        });
      }

      setSuccessMessage('Image updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[MobileImageUploadField] Upload error:', err);
      setErrorMessage(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleApplyManualUrl = () => {
    onChange(manualUrl.trim());
    setSuccessMessage('URL updated');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleClear = () => {
    onChange('');
    setManualUrl('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const aspectClasses = {
    square: 'aspect-square w-24 sm:w-28',
    video: 'aspect-video w-full max-w-sm',
    portrait: 'aspect-[3/4] w-24 sm:w-28',
    auto: `${previewHeightClass} min-w-[6rem]`
  }[aspectRatio];

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Hidden system file picker configured explicitly for mobile gallery selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept={PORTFOLIO_IMAGE_ACCEPT}
        onChange={handleFileSelected}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Header with Title and Vault Action */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold text-white tracking-wide">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        {onOpenVault && (
          <button
            type="button"
            onClick={onOpenVault}
            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Media Vault</span>
          </button>
        )}
      </div>

      {/* Main Preview & Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 p-3 rounded-xl bg-[#090b10] border border-white/10">
        {/* Preview Thumbnail */}
        <div
          onClick={handleTriggerPicker}
          className={`${aspectClasses} rounded-xl overflow-hidden bg-[#161c26] border border-white/10 relative shrink-0 flex items-center justify-center cursor-pointer group shadow-inner transition-all hover:border-sky-400/50`}
          title="Tap to choose photo from mobile gallery"
        >
          {value && value.trim() ? (
            <img
              src={value.trim()}
              alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If broken link, show fallback placeholder
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-slate-500 text-center">
              <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
              <span className="text-[10px] font-mono">No Image</span>
            </div>
          )}

          {/* Hover / Tap Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
            <Upload className="w-4 h-4 mb-0.5 text-sky-400" />
            <span className="text-[9px] font-bold">Choose</span>
          </div>

          {/* Uploading Spinner Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10 p-2">
              <RefreshCw className="w-5 h-5 animate-spin text-sky-400 mb-1" />
              <span className="text-[9px] font-mono text-sky-300 text-center">
                Uploading...
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons & Quick Controls */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Direct Mobile Gallery / File Picker Button */}
            <button
              type="button"
              onClick={handleTriggerPicker}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Change Image (Gallery)' : 'Choose from Gallery'}</span>
            </button>

            {/* Clear Button if image exists */}
            {allowClear && value && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                title="Remove image"
              >
                Clear
              </button>
            )}

            {/* Optional URL Toggle */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors cursor-pointer ml-auto"
            >
              {showUrlInput ? 'Hide URL' : 'Paste URL'}
            </button>
          </div>

          {/* Current URL or Filename Indicator */}
          {value ? (
            <p className="text-[11px] font-mono text-slate-400 truncate select-all">
              <span className="text-slate-500">Source:</span> {value}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              Tap above to upload from mobile gallery, camera roll, or desktop files (JPG, PNG, WebP).
            </p>
          )}

          {/* Manual URL Input Field (Collapsible) */}
          {showUrlInput && (
            <div className="flex items-center gap-1.5 pt-1 animate-in fade-in duration-150">
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyManualUrl();
                  }
                }}
                placeholder={placeholderText}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-white font-mono text-xs focus:border-sky-400 outline-none"
              />
              <button
                type="button"
                onClick={handleApplyManualUrl}
                className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/14 text-white text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Uploading Status Message */}
      {isUploading && uploadStatus && (
        <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
