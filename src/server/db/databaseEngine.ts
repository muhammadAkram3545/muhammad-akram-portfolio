import fs from 'fs';
import path from 'path';
import { PortfolioData, MediaItem } from '../../types/portfolio';
import { VersionHistoryItem, AuditLogEntry, AdminUser } from '../../types/backend';
import { initialPortfolioData } from '../../data/initialPortfolioData';

const DATA_DIR = path.resolve(process.cwd(), 'data', 'db');

const PUBLISHED_FILE = path.join(DATA_DIR, 'published.json');
const DRAFT_FILE = path.join(DATA_DIR, 'draft.json');
const VERSIONS_FILE = path.join(DATA_DIR, 'versions.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');

// Ensure data directories exist
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Atomic write helper to prevent corrupted files
function atomicWriteJson(filePath: string, data: any): void {
  ensureDirectories();
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 6)}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`[DB] Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

// In-Memory Database Cache with write-through
class DatabaseEngine {
  private publishedCache: PortfolioData | null = null;
  private draftCache: PortfolioData | null = null;
  private versionsCache: VersionHistoryItem[] | null = null;
  private mediaCache: MediaItem[] | null = null;
  private auditCache: AuditLogEntry[] | null = null;

  constructor() {
    this.initDatabase();
  }

  public initDatabase() {
    ensureDirectories();

    // 1. Published Portfolio
    if (!fs.existsSync(PUBLISHED_FILE)) {
      console.log('[DB] Seeding published portfolio from initial data...');
      atomicWriteJson(PUBLISHED_FILE, initialPortfolioData);
      this.publishedCache = initialPortfolioData;
    } else {
      this.publishedCache = readJsonFile<PortfolioData>(PUBLISHED_FILE, initialPortfolioData);
    }

    // 2. Draft Portfolio
    if (!fs.existsSync(DRAFT_FILE)) {
      console.log('[DB] Seeding draft portfolio from initial data...');
      atomicWriteJson(DRAFT_FILE, initialPortfolioData);
      this.draftCache = initialPortfolioData;
    } else {
      this.draftCache = readJsonFile<PortfolioData>(DRAFT_FILE, initialPortfolioData);
    }

    // 3. Media Items
    if (!fs.existsSync(MEDIA_FILE)) {
      const initialMedia = initialPortfolioData.media || [];
      atomicWriteJson(MEDIA_FILE, initialMedia);
      this.mediaCache = initialMedia;
    } else {
      this.mediaCache = readJsonFile<MediaItem[]>(MEDIA_FILE, []);
    }

    // 4. Versions History
    if (!fs.existsSync(VERSIONS_FILE)) {
      const initialVersion: VersionHistoryItem = {
        id: 'ver-initial-v1',
        versionNumber: 1,
        versionLabel: 'v1.0.0 (Initial Production Release)',
        author: {
          id: 'usr_admin_01',
          name: 'Muhammad Akram',
          email: 'admin@muhammadakram.dev'
        },
        timestamp: new Date().toISOString(),
        summary: 'Baseline professional portfolio release with full showcase sections.',
        stats: {
          sectionsCount: initialPortfolioData.sections.length,
          projectsCount: initialPortfolioData.projects.length,
          skillsCount: initialPortfolioData.skills.length,
          servicesCount: initialPortfolioData.services.length,
          mediaCount: initialPortfolioData.media.length
        },
        snapshot: initialPortfolioData
      };
      atomicWriteJson(VERSIONS_FILE, [initialVersion]);
      this.versionsCache = [initialVersion];
    } else {
      this.versionsCache = readJsonFile<VersionHistoryItem[]>(VERSIONS_FILE, []);
    }

    // 5. Audit Log
    if (!fs.existsSync(AUDIT_FILE)) {
      atomicWriteJson(AUDIT_FILE, []);
      this.auditCache = [];
    } else {
      this.auditCache = readJsonFile<AuditLogEntry[]>(AUDIT_FILE, []);
    }
  }

  // Published
  public getPublished(): PortfolioData {
    if (!this.publishedCache) {
      this.publishedCache = readJsonFile<PortfolioData>(PUBLISHED_FILE, initialPortfolioData);
    }
    return this.publishedCache;
  }

  public savePublished(data: PortfolioData): void {
    this.publishedCache = data;
    atomicWriteJson(PUBLISHED_FILE, data);
  }

  // Draft
  public getDraft(): PortfolioData {
    if (!this.draftCache) {
      this.draftCache = readJsonFile<PortfolioData>(DRAFT_FILE, initialPortfolioData);
    }
    return this.draftCache;
  }

  public saveDraft(data: PortfolioData): void {
    this.draftCache = data;
    atomicWriteJson(DRAFT_FILE, data);
  }

  // Versions
  public getVersions(): VersionHistoryItem[] {
    if (!this.versionsCache) {
      this.versionsCache = readJsonFile<VersionHistoryItem[]>(VERSIONS_FILE, []);
    }
    return this.versionsCache;
  }

  public addVersion(version: VersionHistoryItem): void {
    const list = this.getVersions();
    const updated = [version, ...list];
    this.versionsCache = updated;
    atomicWriteJson(VERSIONS_FILE, updated);
  }

  public getVersionById(id: string): VersionHistoryItem | null {
    const list = this.getVersions();
    return list.find((v) => v.id === id) || null;
  }

  // Media
  public getMedia(): MediaItem[] {
    if (!this.mediaCache) {
      this.mediaCache = readJsonFile<MediaItem[]>(MEDIA_FILE, []);
    }
    return this.mediaCache;
  }

  public saveMedia(mediaList: MediaItem[]): void {
    this.mediaCache = mediaList;
    atomicWriteJson(MEDIA_FILE, mediaList);
  }

  public addMediaItem(item: MediaItem): void {
    const list = this.getMedia();
    const updated = [item, ...list];
    this.saveMedia(updated);
  }

  public updateMediaItem(id: string, updates: Partial<MediaItem>): MediaItem | null {
    const list = this.getMedia();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const updatedItem = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    list[idx] = updatedItem;
    this.saveMedia(list);
    return updatedItem;
  }

  public deleteMediaItem(id: string): boolean {
    const list = this.getMedia();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length !== list.length) {
      this.saveMedia(filtered);
      return true;
    }
    return false;
  }

  // Audit Logs
  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    const current = this.getAuditLogs();
    const updated = [newEntry, ...current.slice(0, 199)]; // Keep latest 200 logs
    this.auditCache = updated;
    atomicWriteJson(AUDIT_FILE, updated);
    return newEntry;
  }

  public getAuditLogs(): AuditLogEntry[] {
    if (!this.auditCache) {
      this.auditCache = readJsonFile<AuditLogEntry[]>(AUDIT_FILE, []);
    }
    return this.auditCache;
  }

  // Users
  public getUsers(): AdminUser[] {
    return readJsonFile<AdminUser[]>(USERS_FILE, []);
  }

  public saveUsers(users: AdminUser[]): void {
    atomicWriteJson(USERS_FILE, users);
  }

  public getStats() {
    const pub = this.getPublished();
    const draft = this.getDraft();
    const versions = this.getVersions();
    const media = this.getMedia();
    return {
      draftLastUpdated: draft.lastUpdated || new Date().toISOString(),
      publishedLastUpdated: pub.lastUpdated || new Date().toISOString(),
      versionsCount: versions.length,
      mediaCount: media.length
    };
  }
}

export const db = new DatabaseEngine();
