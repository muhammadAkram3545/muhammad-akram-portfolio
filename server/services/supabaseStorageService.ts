import path from 'path';
import fs from 'fs';
import { getSupabaseAdminClient, isSupabaseConfigured } from '../config/supabase';
import { MediaType } from '../../src/types/portfolio';

export interface StorageUploadOptions {
  folder?: 'hero' | 'projects' | 'gallery' | 'skills' | 'services' | 'general';
  contentType?: string;
  originalFilename?: string;
  isPublic?: boolean;
}

export interface StorageUploadResult {
  url: string;
  storagePath: string;
  provider: 'supabase-storage' | 'local-disk';
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif',
  '.mp4', '.webm',
  '.mp3', '.wav',
  '.pdf'
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BUCKET_NAME = 'portfolio-media';

export class SupabaseStorageService {
  /**
   * Sanitizes filenames to avoid directory traversal, dangerous characters, or shell attacks.
   */
  public sanitizeFilename(filename: string): string {
    const parsed = path.parse(filename);
    const cleanName = parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 80);
    const ext = parsed.ext.toLowerCase();
    const timestamp = Date.now();
    return `${cleanName}_${timestamp}${ext}`;
  }

  /**
   * Determines the storage folder based on original filename or hints
   */
  public determineFolder(filename: string, hint?: string): 'hero' | 'projects' | 'gallery' | 'skills' | 'services' | 'general' {
    if (hint && ['hero', 'projects', 'gallery', 'skills', 'services', 'general'].includes(hint)) {
      return hint as any;
    }
    const lower = filename.toLowerCase();
    if (lower.includes('avatar') || lower.includes('hero') || lower.includes('portrait')) return 'hero';
    if (lower.includes('project') || lower.includes('showcase')) return 'projects';
    if (lower.includes('gallery')) return 'gallery';
    if (lower.includes('skill') || lower.includes('tech')) return 'skills';
    if (lower.includes('service') || lower.includes('offering')) return 'services';
    return 'general';
  }

  /**
   * Validates file upload constraints
   */
  public validateFile(buffer: Buffer, originalFilename: string, mimeType?: string): void {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size (${(buffer.length / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 50MB.`);
    }

    const ext = path.extname(originalFilename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(`File extension '${ext}' is not permitted. Allowed extensions: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`);
    }

    if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`MIME type '${mimeType}' is not allowed.`);
    }
  }

  /**
   * Uploads file to Supabase Storage (or local fallback if Supabase not configured)
   */
  public async upload(
    fileBuffer: Buffer,
    originalFilename: string,
    options: StorageUploadOptions = {}
  ): Promise<StorageUploadResult> {
    const ext = path.extname(originalFilename).toLowerCase();
    const mimeType = options.contentType || this.guessMimeType(ext);

    this.validateFile(fileBuffer, originalFilename, mimeType);

    const safeFilename = this.sanitizeFilename(originalFilename);
    const folder = options.folder || this.determineFolder(originalFilename);
    const storagePath = `${folder}/${safeFilename}`;

    // 1. Try Supabase Storage if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        try {
          const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!error) {
            const { data: publicUrlData } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(storagePath);

            return {
              url: publicUrlData.publicUrl,
              storagePath,
              provider: 'supabase-storage',
              filename: safeFilename,
              fileSizeBytes: fileBuffer.length,
              mimeType
            };
          } else {
            console.warn('[SupabaseStorageService] Supabase upload failed, using local disk fallback:', error.message);
          }
        } catch (supabaseErr: any) {
          console.warn('[SupabaseStorageService] Exception during Supabase upload:', supabaseErr.message);
        }
      }
    }

    // 2. Local disk fallback (development & offline resilience)
    const localUploadsDir = path.resolve(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }
    const targetFilePath = path.join(localUploadsDir, safeFilename);
    fs.writeFileSync(targetFilePath, fileBuffer);

    return {
      url: `/uploads/${folder}/${safeFilename}`,
      storagePath: `uploads/${folder}/${safeFilename}`,
      provider: 'local-disk',
      filename: safeFilename,
      fileSizeBytes: fileBuffer.length,
      mimeType
    };
  }

  /**
   * Deletes a file from Supabase Storage or local disk
   */
  public async delete(storagePath: string): Promise<void> {
    if (!storagePath) return;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        try {
          await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
          return;
        } catch (err) {
          console.warn('[SupabaseStorageService] Could not remove from Supabase bucket:', err);
        }
      }
    }

    // Local file fallback removal
    try {
      const localPath = path.resolve(process.cwd(), 'public', storagePath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch {
      // Ignore
    }
  }

  private guessMimeType(ext: string): string {
    switch (ext) {
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.png': return 'image/png';
      case '.webp': return 'image/webp';
      case '.svg': return 'image/svg+xml';
      case '.gif': return 'image/gif';
      case '.mp4': return 'video/mp4';
      case '.webm': return 'video/webm';
      case '.mp3': return 'audio/mpeg';
      case '.wav': return 'audio/wav';
      case '.pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();
