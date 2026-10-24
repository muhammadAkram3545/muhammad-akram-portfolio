import { isSupabaseConfigured } from '../config/supabase';
import { SupabaseRepository } from '../db/supabaseRepository';
import { db as jsonDb } from '../../src/server/db/databaseEngine';
import { PortfolioData, MediaItem } from '../../src/types/portfolio';
import { VersionHistoryItem, AuditLogEntry } from '../../src/types/backend';
import { initialPortfolioData } from '../../src/data/initialPortfolioData';
import { sanitizeCustomCss } from '../validators/cssSanitizer';

export class PortfolioService {
  private supabaseRepo: SupabaseRepository | null = null;
  private useSupabase = false;
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    if (isSupabaseConfigured()) {
      try {
        this.supabaseRepo = new SupabaseRepository();
        this.useSupabase = true;
        console.log('[PortfolioService] Connected to Supabase PostgreSQL & Storage engine.');
      } catch (err) {
        console.error('[PortfolioService] Failed to initialize Supabase repo:', err);
        this.useSupabase = false;
      }
    } else {
      if (this.isProduction) {
        console.warn('⚠️ [CRITICAL CONFIGURATION NOTICE]');
        console.warn('Running in PRODUCTION mode without Supabase credentials configured!');
        console.warn('Define SUPABASE_URL and SUPABASE_SECRET_KEY in your Render dashboard.');
      } else {
        console.log('[PortfolioService] Initialized with local JSON storage engine (Supabase not configured in development).');
      }
      this.useSupabase = false;
    }
  }

  public getBackendInfo() {
    return {
      type: this.useSupabase ? 'supabase' : 'json',
      activeDatabase: this.useSupabase ? 'supabase-postgresql' : 'local-json',
      storageProvider: this.useSupabase ? 'supabase-storage' : 'local-disk',
      persistence: 'permanent',
      tablesSupported: [
        'users',
        'portfolio_settings',
        'sections',
        'hero_content',
        'about_content',
        'skills',
        'services',
        'projects',
        'project_gallery',
        'experience',
        'contact_settings',
        'navigation_items',
        'footer_settings',
        'media',
        'media_references',
        'drafts',
        'published_versions',
        'version_history',
        'sessions',
        'audit_logs'
      ]
    };
  }

  // ==========================================
  // 1. PUBLISHED PORTFOLIO (Strictly Public)
  // ==========================================

  public async getPublished(): Promise<PortfolioData> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        const data = await this.supabaseRepo.getPublished();
        if (data) return data;
      } catch (err) {
        console.error('[PortfolioService] Error fetching published from Supabase:', err);
      }
    }
    return jsonDb.getPublished() || initialPortfolioData;
  }

  public async savePublished(data: PortfolioData, authorId?: string): Promise<PortfolioData> {
    // Sanitize any custom CSS in settings or sections
    const cleanData = this.sanitizePortfolioData(data);

    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.savePublished(cleanData, authorId);
      } catch (err: any) {
        console.warn('[PortfolioService] Warning: Could not mirror published to Supabase:', err.message || err);
      }
    }

    // Keep JSON copy in sync as backup / local fallback
    jsonDb.savePublished(cleanData);
    jsonDb.saveDraft(cleanData);

    return cleanData;
  }

  // ==========================================
  // 2. DRAFT PORTFOLIO (Private Studio Only)
  // ==========================================

  public async getDraft(): Promise<PortfolioData> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        const data = await this.supabaseRepo.getDraft();
        if (data) return data;
      } catch (err) {
        console.error('[PortfolioService] Error fetching draft from Supabase:', err);
      }
    }
    return jsonDb.getDraft() || jsonDb.getPublished() || initialPortfolioData;
  }

  public async saveDraft(data: PortfolioData, authorId?: string): Promise<PortfolioData> {
    const cleanData = this.sanitizePortfolioData(data);

    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.saveDraft(cleanData, authorId);
      } catch (err: any) {
        console.warn('[PortfolioService] Warning: Could not mirror draft to Supabase:', err.message || err);
      }
    }

    jsonDb.saveDraft(cleanData);
    return cleanData;
  }

  public async discardDraft(): Promise<PortfolioData> {
    const published = await this.getPublished();
    await this.saveDraft(published, 'studio_discard');
    return published;
  }

  // ==========================================
  // 3. VERSION HISTORY
  // ==========================================

  public async getVersions(): Promise<VersionHistoryItem[]> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        return await this.supabaseRepo.getVersions();
      } catch (err) {
        console.error('[PortfolioService] Error fetching versions from Supabase:', err);
      }
    }
    return jsonDb.getVersions();
  }

  public async getVersionById(id: string): Promise<VersionHistoryItem | null> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        return await this.supabaseRepo.getVersionById(id);
      } catch (err) {
        console.error('[PortfolioService] Error fetching version by id from Supabase:', err);
      }
    }
    return jsonDb.getVersionById(id) || null;
  }

  public async restoreVersion(versionId: string, authorId?: string): Promise<PortfolioData> {
    const version = await this.getVersionById(versionId);
    if (!version) {
      throw new Error(`Version '${versionId}' not found.`);
    }

    // Restoring loads the snapshot into the current draft state
    await this.saveDraft(version.snapshot, authorId || 'studio_restore');
    return version.snapshot;
  }

  // ==========================================
  // 4. MEDIA MANAGEMENT
  // ==========================================

  public async getMedia(): Promise<MediaItem[]> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        return await this.supabaseRepo.getMedia();
      } catch (err) {
        console.error('[PortfolioService] Error fetching media from Supabase:', err);
      }
    }
    return jsonDb.getMedia();
  }

  public async addMediaItem(item: MediaItem): Promise<MediaItem> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.addMediaItem(item);
      } catch (err) {
        console.error('[PortfolioService] Error adding media item to Supabase:', err);
      }
    }
    jsonDb.addMediaItem(item);
    return item;
  }

  public async updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.updateMediaItem(id, updates);
      } catch (err) {
        console.error('[PortfolioService] Error updating media item in Supabase:', err);
      }
    }
    return jsonDb.updateMediaItem(id, updates);
  }

  public async deleteMediaItem(id: string): Promise<boolean> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.deleteMediaItem(id);
      } catch (err) {
        console.error('[PortfolioService] Error deleting media item from Supabase:', err);
      }
    }
    return jsonDb.deleteMediaItem(id);
  }

  public async addMedia(item: MediaItem): Promise<MediaItem> {
    return this.addMediaItem(item);
  }

  public async updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> {
    return this.updateMediaItem(id, updates);
  }

  public async deleteMedia(id: string): Promise<boolean> {
    return this.deleteMediaItem(id);
  }

  public async addVersion(version: VersionHistoryItem): Promise<void> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.addVersion(version);
      } catch (err) {
        console.error('[PortfolioService] Error adding version to Supabase:', err);
      }
    }
    jsonDb.addVersion(version);
  }

  public async addAuditLog(entry: {
    userId?: string;
    userEmail?: string;
    action: string;
    resource?: string;
    details?: any;
    ip?: string;
    ipAddress?: string;
  }): Promise<void> {
    await this.logAudit(entry.action, entry.userId, {
      ...entry.details,
      resource: entry.resource,
      userEmail: entry.userEmail
    }, entry.ip || entry.ipAddress);
  }

  public async getStats() {
    const published = await this.getPublished();
    const draft = await this.getDraft();
    const versions = await this.getVersions();
    const media = await this.getMedia();
    return {
      publishedLastUpdated: published.lastUpdated,
      draftLastUpdated: draft.lastUpdated,
      versionsCount: versions.length,
      mediaCount: media.length,
      projectsCount: published.projects?.length || 0,
      skillsCount: published.skills?.length || 0,
      servicesCount: published.services?.length || 0
    };
  }

  // ==========================================
  // 5. AUDIT LOGGING & EXPORTS
  // ==========================================

  public async logAudit(action: any, userId?: string, details?: any, ipAddress?: string): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action: action as any,
      userId: userId || 'anonymous',
      userEmail: details?.userEmail || 'admin@muhammadakram.dev',
      resource: details?.resource || 'Portfolio System',
      details: details || {},
      ip: ipAddress,
      timestamp: new Date().toISOString()
    };

    if (this.useSupabase && this.supabaseRepo) {
      await this.supabaseRepo.addAuditLog(entry);
    }
    jsonDb.addAuditLog(entry);
  }

  public async exportCompletePortfolio(): Promise<{
    published: PortfolioData;
    draft: PortfolioData;
    versionsCount: number;
    mediaCount: number;
    exportedAt: string;
  }> {
    const published = await this.getPublished();
    const draft = await this.getDraft();
    const versions = await this.getVersions();
    const media = await this.getMedia();

    return {
      published,
      draft,
      versionsCount: versions.length,
      mediaCount: media.length,
      exportedAt: new Date().toISOString()
    };
  }

  // Helper to sanitize any dangerous CSS or script injection
  private sanitizePortfolioData(data: PortfolioData): PortfolioData {
    const cloned: PortfolioData = JSON.parse(JSON.stringify(data));

    // Sanitize custom CSS in sections
    if (cloned.sections && Array.isArray(cloned.sections)) {
      for (const section of cloned.sections) {
        if (section.style && typeof (section.style as any).customCss === 'string') {
          (section.style as any).customCss = sanitizeCustomCss((section.style as any).customCss);
        }
      }
    }

    return cloned;
  }
}

export const portfolioService = new PortfolioService();
