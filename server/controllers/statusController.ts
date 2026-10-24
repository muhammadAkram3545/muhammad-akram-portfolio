import { Request, Response } from 'express';
import { testSupabaseConnection, isSupabaseConfigured } from '../config/supabase';
import { portfolioService } from '../services/portfolioService';

export class StatusController {
  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const supabaseTest = await testSupabaseConnection();
      const backendInfo = portfolioService.getBackendInfo();
      const stats = await portfolioService.getStats();

      res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        renderDeployable: true,
        database: {
          configuredType: isSupabaseConfigured() ? 'supabase-postgresql' : 'json-development-mode',
          activeEngine: backendInfo.type,
          supabaseConnected: supabaseTest.success,
          supabaseMessage: supabaseTest.message,
          supabaseConfigured: isSupabaseConfigured(),
          supabaseUrl: process.env.SUPABASE_URL ? 'configured' : 'missing',
          tablesSupportedCount: backendInfo.tablesSupported.length
        },
        storage: {
          provider: backendInfo.storageProvider,
          bucket: 'portfolio-media',
          mediaItemsCount: stats.mediaCount
        },
        portfolio: {
          publishedLastUpdated: stats.publishedLastUpdated,
          draftLastUpdated: stats.draftLastUpdated,
          versionCount: stats.versionsCount,
          projectsCount: stats.projectsCount,
          skillsCount: stats.skillsCount,
          servicesCount: stats.servicesCount
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'degraded',
        error: error.message || 'Error collecting system diagnostics'
      });
    }
  }
}
