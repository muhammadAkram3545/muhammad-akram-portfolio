import { PortfolioData, MediaItem, MediaUsageRef } from './portfolio';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  token: string;
  user: AdminUser;
  createdAt: string;
  expiresAt: string;
}

export interface VersionHistoryItem {
  id: string;
  versionNumber: number;
  versionLabel: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
  summary: string;
  stats: {
    sectionsCount: number;
    projectsCount: number;
    skillsCount: number;
    servicesCount: number;
    mediaCount: number;
  };
  snapshot: PortfolioData;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'SAVE_DRAFT'
    | 'PUBLISH'
    | 'RESTORE_VERSION'
    | 'UPLOAD_MEDIA'
    | 'DELETE_MEDIA'
    | 'REPLACE_MEDIA'
    | 'PASSWORD_CHANGE';
  resource: string;
  details?: Record<string, any>;
  ip?: string;
}

export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    activeSections: number;
    activeProjects: number;
    skillsCount: number;
    servicesCount: number;
    mediaItems: number;
  };
}

export interface BackendStatus {
  status: 'connected' | 'offline';
  database: {
    provider: 'local-file' | 'postgres' | 'supabase' | 'firestore';
    connected: boolean;
    recordsCount: {
      draftLastUpdated: string;
      publishedLastUpdated: string;
      versionsCount: number;
      mediaCount: number;
    };
  };
  storage: {
    provider: 'local-disk' | 'r2' | 's3' | 'supabase';
    connected: boolean;
  };
  auth: {
    mode: 'session-cookie-bearer';
    authenticated: boolean;
    userEmail?: string;
    expiresAt?: string;
  };
}
