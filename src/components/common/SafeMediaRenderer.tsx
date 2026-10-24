import React, { useState } from 'react';
import { ImageOff, Film, Music, FileText } from 'lucide-react';
import { MediaType } from '../../types/portfolio';

interface SafeMediaRendererProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  mediaType?: MediaType;
  fallbackText?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: (e: React.MouseEvent) => void;
  onLoad?: () => void;
  onError?: () => void;
}

export const SafeMediaRenderer: React.FC<SafeMediaRendererProps> = ({
  src,
  alt = 'Media asset',
  className = '',
  style,
  mediaType = 'image',
  fallbackText,
  referrerPolicy = 'no-referrer',
  onClick,
  onLoad,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const trimmedSrc = src?.trim();

  // Detect type if not specified
  const effectiveMediaType: MediaType =
    mediaType ||
    (trimmedSrc?.match(/\.(mp4|webm|ogg)$/i)
      ? 'video'
      : trimmedSrc?.match(/\.(mp3|wav|aac)$/i)
      ? 'audio'
      : trimmedSrc?.match(/\.(pdf|doc|docx)$/i)
      ? 'document'
      : 'image');

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  if (!trimmedSrc || hasError) {
    return (
      <div
        style={style}
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-[#0d1117] border border-white/10 text-slate-500 p-4 text-center select-none overflow-hidden ${className}`}
        role="img"
        aria-label={alt || 'Fallback placeholder for missing media'}
      >
        {effectiveMediaType === 'video' ? (
          <Film className="w-6 h-6 text-slate-600 mb-1.5" />
        ) : effectiveMediaType === 'audio' ? (
          <Music className="w-6 h-6 text-slate-600 mb-1.5" />
        ) : effectiveMediaType === 'document' ? (
          <FileText className="w-6 h-6 text-slate-600 mb-1.5" />
        ) : (
          <ImageOff className="w-6 h-6 text-slate-600 mb-1.5" />
        )}
        <span className="text-[11px] font-mono text-slate-400 font-medium">
          {fallbackText || 'Media Asset Unavailable'}
        </span>
        <span className="text-[9px] text-slate-600 font-mono mt-0.5">
          Select or replace in Media Library
        </span>
      </div>
    );
  }

  if (effectiveMediaType === 'video') {
    return (
      <video
        src={trimmedSrc}
        controls
        playsInline
        style={style}
        className={className}
        onClick={onClick}
        onError={handleError}
        onLoadedData={onLoad}
      >
        <track kind="captions" />
        Your browser does not support HTML5 video.
      </video>
    );
  }

  if (effectiveMediaType === 'audio') {
    return (
      <div className={`p-3 bg-[#0d1117] border border-white/10 rounded-xl flex items-center gap-3 ${className}`}>
        <Music className="w-5 h-5 text-sky-400 shrink-0" />
        <audio
          src={trimmedSrc}
          controls
          className="w-full h-8"
          onError={handleError}
          onLoadedData={onLoad}
        >
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={alt}
      style={style}
      className={className}
      referrerPolicy={referrerPolicy}
      onClick={onClick}
      onError={handleError}
      onLoad={onLoad}
      loading="lazy"
    />
  );
};
