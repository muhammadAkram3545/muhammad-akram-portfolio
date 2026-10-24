import { Request, Response } from 'express';
import { portfolioService } from '../services/portfolioService';
import { validatePortfolioForPublish } from '../validators/portfolioValidator';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { PortfolioData } from '../../src/types/portfolio';
import { VersionHistoryItem } from '../../src/types/backend';

export class PortfolioController {
  // Public Endpoint: Get currently published portfolio
  public static async getPublished(req: Request, res: Response): Promise<void> {
    try {
      const data = await portfolioService.getPublished();
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json(data);
    } catch (error: any) {
      console.error('[PortfolioController] Error fetching published portfolio:', error);
      res.status(500).json({ error: 'Failed to retrieve published portfolio.' });
    }
  }

  // Admin Endpoint: Get current working draft
  public static async getDraft(req: Request, res: Response): Promise<void> {
    try {
      const draft = await portfolioService.getDraft();
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json(draft);
    } catch (error: any) {
      console.error('[PortfolioController] Error retrieving draft:', error);
      res.status(500).json({ error: 'Failed to retrieve draft portfolio.' });
    }
  }

  // Admin Endpoint: Save/Autosave draft
  public static async saveDraft(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const updatedDraft: PortfolioData = req.body;

      if (!updatedDraft || !updatedDraft.personal) {
        res.status(400).json({ error: 'Invalid portfolio data payload.' });
        return;
      }

      updatedDraft.lastUpdated = new Date().toISOString();
      await portfolioService.saveDraft(updatedDraft, authReq.user?.id);

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'SAVE_DRAFT',
        resource: 'Portfolio Draft',
        details: { timestamp: updatedDraft.lastUpdated },
        ip: req.ip
      });

      res.json({
        success: true,
        lastUpdated: updatedDraft.lastUpdated
      });
    } catch (error: any) {
      console.error('[PortfolioController] Error saving draft:', error);
      res.status(500).json({ error: 'Failed to save draft.' });
    }
  }

  // Admin Endpoint: Validate & Publish draft
  public static async publish(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const payloadData: PortfolioData = req.body.data || (await portfolioService.getDraft());
      const releaseNotes: string = req.body.releaseNotes || 'Production content release';

      // 1. Validate content
      const validation = validatePortfolioForPublish(payloadData);
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Content validation failed. Please address errors before publishing.',
          validation
        });
        return;
      }

      // 2. Prepare published record
      const nextVersionNumber = (payloadData.version || 1) + 1;
      const publishedRecord: PortfolioData = {
        ...payloadData,
        version: nextVersionNumber,
        lastUpdated: new Date().toISOString()
      };

      // 3. Save to database
      await portfolioService.savePublished(publishedRecord, authReq.user?.id);

      // 4. Create Immutable Version Record
      const versionRecord: VersionHistoryItem = {
        id: `ver-${Date.now()}`,
        versionNumber: nextVersionNumber,
        versionLabel: `v1.0.${nextVersionNumber} (${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })})`,
        author: {
          id: authReq.user?.id || 'usr_admin_01',
          name: authReq.user?.displayName || 'Administrator',
          email: authReq.user?.email || 'admin@muhammadakram.dev'
        },
        timestamp: new Date().toISOString(),
        summary: releaseNotes,
        stats: {
          sectionsCount: publishedRecord.sections.length,
          projectsCount: publishedRecord.projects.length,
          skillsCount: publishedRecord.skills.length,
          servicesCount: publishedRecord.services.length,
          mediaCount: publishedRecord.media?.length || 0
        },
        snapshot: publishedRecord
      };

      await portfolioService.addVersion(versionRecord);

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'PUBLISH',
        resource: `Version ${versionRecord.versionLabel}`,
        details: { versionId: versionRecord.id, releaseNotes },
        ip: req.ip
      });

      res.json({
        success: true,
        published: publishedRecord,
        version: versionRecord,
        validation
      });
    } catch (error: any) {
      console.error('[PortfolioController] Error publishing portfolio:', error);
      res.status(500).json({ error: error.message || 'Failed to publish portfolio.' });
    }
  }

  // Admin Endpoint: Discard draft changes and reset to published
  public static async discardDraft(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const published = await portfolioService.getPublished();
      await portfolioService.saveDraft(published, authReq.user?.id);

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'SAVE_DRAFT',
        resource: 'Portfolio Draft (Reset to Published)',
        details: {},
        ip: req.ip
      });

      res.json({ success: true, draft: published });
    } catch (error: any) {
      console.error('[PortfolioController] Error discarding draft:', error);
      res.status(500).json({ error: 'Failed to reset draft.' });
    }
  }

  // Admin Endpoint: List version history
  public static async getVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = await portfolioService.getVersions();
      res.json(versions);
    } catch (error: any) {
      console.error('[PortfolioController] Error retrieving version history:', error);
      res.status(500).json({ error: 'Failed to retrieve version history.' });
    }
  }

  // Admin Endpoint: Get specific version snapshot
  public static async getVersionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const version = await portfolioService.getVersionById(id);
      if (!version) {
        res.status(404).json({ error: `Version with ID "${id}" was not found.` });
        return;
      }
      res.json(version);
    } catch (error: any) {
      console.error('[PortfolioController] Error retrieving version:', error);
      res.status(500).json({ error: 'Failed to retrieve version snapshot.' });
    }
  }

  // Admin Endpoint: Restore historical snapshot as active draft
  public static async restoreVersion(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const restoredDraft = await portfolioService.restoreVersion(id, authReq.user?.id);

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'RESTORE_VERSION',
        resource: `Version ${id}`,
        details: { restoredVersionId: id },
        ip: req.ip
      });

      res.json({
        success: true,
        message: `Version "${id}" restored successfully to current draft.`,
        draft: restoredDraft
      });
    } catch (error: any) {
      console.error('[PortfolioController] Error restoring version:', error);
      res.status(500).json({ error: error.message || 'Failed to restore version.' });
    }
  }
}
