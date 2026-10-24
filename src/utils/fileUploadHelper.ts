import { mediaService } from '../services/mediaService';
import { MediaItem } from '../types/portfolio';

export interface ProcessedUploadResult {
  url: string;
  mediaItem?: MediaItem;
  filename: string;
  mimeType: string;
}

/**
 * Standard accepted MIME types & extensions for portfolio images
 * Covers JPEG, PNG, WEBP, GIF, SVG, AVIF, HEIC, HEIF
 */
export const PORTFOLIO_IMAGE_ACCEPT =
  'image/*,image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,image/heic,image/heif';

/**
 * Reads a browser File (from device gallery or camera) into a base64 Data URL,
 * uploads it to the backend media endpoint (storing in Supabase Storage or local fallback),
 * and creates or registers a MediaItem.
 */
export async function uploadLocalFile(
  file: File,
  options: {
    name?: string;
    altText?: string;
    onProgress?: (percent: number, statusText: string) => void;
  } = {}
): Promise<ProcessedUploadResult> {
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    throw new Error(`File "${file.name}" exceeds the maximum allowed size of 25MB.`);
  }

  options.onProgress?.(20, 'Reading image from device...');

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(new Error('Failed to read image file from device.'));
    reader.readAsDataURL(file);
  });

  options.onProgress?.(50, 'Uploading image to storage...');

  const cleanName =
    options.name || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const cleanAlt = options.altText || cleanName;
  const mimeType = file.type || 'image/jpeg';

  let uploadedItem: MediaItem | null = null;
  try {
    uploadedItem = await mediaService.upload({
      dataUrl,
      filename: file.name,
      name: cleanName,
      mimeType,
      altText: cleanAlt
    });
  } catch (err: any) {
    console.warn('[uploadLocalFile] Server upload fallback to client data URL:', err);
  }

  options.onProgress?.(100, 'Image ready');

  return {
    url: uploadedItem?.url || dataUrl,
    mediaItem: uploadedItem || undefined,
    filename: file.name,
    mimeType
  };
}
