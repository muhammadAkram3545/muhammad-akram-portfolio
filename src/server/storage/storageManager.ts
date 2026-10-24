import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaItem, MediaType } from '../../types/portfolio';
import { isSupabaseConfigured, getSupabaseAdminClient } from '../../../server/config/supabase';

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const BUCKET_NAME = 'portfolio-media';

export interface StorageAdapter {
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<{ url: string; filename: string; sizeBytes: number; storagePath?: string }>;
  delete(urlOrPath: string): Promise<boolean>;
}

// 1. Supabase Storage Adapter for Production
export class SupabaseStorageAdapter implements StorageAdapter {
  public async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<{ url: string; filename: string; sizeBytes: number; storagePath?: string }> {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      throw new Error('Supabase client not available for storage upload.');
    }

    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const uniqueFilename = `${baseName}_${Date.now()}${ext}`;

    // Categorize folder
    let folder = 'general';
    const lower = originalName.toLowerCase();
    if (lower.includes('avatar') || lower.includes('hero') || lower.includes('portrait')) folder = 'hero';
    else if (lower.includes('project') || lower.includes('showcase')) folder = 'projects';
    else if (lower.includes('gallery')) folder = 'gallery';
    else if (lower.includes('skill')) folder = 'skills';
    else if (lower.includes('service')) folder = 'services';

    const storagePath = `${folder}/${uniqueFilename}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn('[SupabaseStorageAdapter] Upload failed, falling back to local disk:', error.message);
      const fallback = new LocalDiskStorageAdapter();
      return fallback.upload(buffer, originalName, mimeType);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      url: publicUrlData.publicUrl,
      filename: uniqueFilename,
      sizeBytes: buffer.length,
      storagePath
    };
  }

  public async delete(urlOrPath: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (!supabase || !urlOrPath) return false;

    try {
      let pathToDelete = urlOrPath;
      if (urlOrPath.includes(BUCKET_NAME + '/')) {
        pathToDelete = urlOrPath.split(BUCKET_NAME + '/')[1];
      }
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([pathToDelete]);
      return !error;
    } catch {
      return false;
    }
  }
}

// 2. Production-Grade Local Disk Storage Adapter (Development & Offline Resilience)
export class LocalDiskStorageAdapter implements StorageAdapter {
  constructor() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  public async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<{ url: string; filename: string; sizeBytes: number; storagePath?: string }> {
    const ext = path.extname(originalName).toLowerCase() || '.bin';
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const randomHex = crypto.randomBytes(4).toString('hex');
    const uniqueFilename = `${safeBase}-${Date.now()}-${randomHex}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);
    const url = `/uploads/${uniqueFilename}`;

    return {
      url,
      filename: uniqueFilename,
      sizeBytes: buffer.length,
      storagePath: `uploads/${uniqueFilename}`
    };
  }

  public async delete(url: string): Promise<boolean> {
    try {
      const filename = path.basename(url);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Factory to select active adapter
function createStorageAdapter(): StorageAdapter {
  if (isSupabaseConfigured()) {
    console.log('[StorageManager] Using Supabase Storage adapter (bucket: portfolio-media).');
    return new SupabaseStorageAdapter();
  }
  return new LocalDiskStorageAdapter();
}

export const storageAdapter = createStorageAdapter();

// Helper to determine media type from extension & MIME
export function detectMediaType(mimeType: string, filename: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) return 'document';

  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '')) return 'image';
  if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'aac'].includes(ext || '')) return 'audio';
  if (['pdf', 'doc', 'docx'].includes(ext || '')) return 'document';

  return 'image';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
