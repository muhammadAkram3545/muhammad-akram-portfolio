import { authManager } from '../../src/server/auth/authManager';
import { isSupabaseConfigured } from '../config/supabase';
import { SupabaseRepository } from '../db/supabaseRepository';
import { AdminSession } from '../../src/types/backend';

export class AuthService {
  private supabaseRepo: SupabaseRepository | null = null;
  private useSupabase = false;

  constructor() {
    if (isSupabaseConfigured()) {
      try {
        this.supabaseRepo = new SupabaseRepository();
        this.useSupabase = true;
      } catch (err) {
        console.error('[AuthService] Error initializing Supabase repo for auth:', err);
      }
    }
  }

  public async login(email: string, passkey: string, ip: string = '127.0.0.1', userAgent?: string) {
    try {
      const result = authManager.login(email, passkey, ip);

      if (this.useSupabase && this.supabaseRepo) {
        try {
          await this.supabaseRepo.createSession({
            id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            token: result.token,
            userId: result.user.id,
            user: result.user,
            createdAt: new Date().toISOString(),
            expiresAt: result.expiresAt
          });

          await this.supabaseRepo.addAuditLog({
            id: `audit-${Date.now()}`,
            userId: result.user.id,
            userEmail: result.user.email,
            action: 'LOGIN',
            resource: 'Studio Visual Admin',
            details: { ip, userAgent },
            ip: ip,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.warn('[AuthService] Warning: Could not mirror session in Supabase:', err);
        }
      }

      return {
        success: true,
        token: result.token,
        user: result.user,
        expiresAt: result.expiresAt
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Authentication failed.'
      };
    }
  }

  public async verifySession(token: string): Promise<AdminSession | null> {
    // Check in-memory / local auth manager first for maximum performance
    const localSession = authManager.validateSession(token);
    if (localSession) {
      return localSession;
    }

    // If not found in memory, try Supabase session table
    if (this.useSupabase && this.supabaseRepo) {
      try {
        const remoteSession = await this.supabaseRepo.getSession(token);
        if (remoteSession) return remoteSession;
      } catch (err) {
        console.warn('[AuthService] Error verifying session from Supabase:', err);
      }
    }

    return null;
  }

  public async logout(token: string): Promise<boolean> {
    if (this.useSupabase && this.supabaseRepo) {
      try {
        await this.supabaseRepo.deleteSession(token);
      } catch (err) {
        console.warn('[AuthService] Error clearing Supabase session:', err);
      }
    }
    authManager.logout(token);
    return true;
  }

  public getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
  }
}

export const authService = new AuthService();
