import { Request, Response } from 'express';
import { portfolioService } from '../services/portfolioService';
import { storageAdapter, detectMediaType, formatBytes } from '../../src/server/storage/storageManager';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { MediaItem } from '../../src/types/portfolio';

export class MediaController {
  public static async getMedia(req: Request, res: Response): Promise<void> {
    try {
      const items = await portfolioService.getMedia();
      res.json(items);
    } catch (error: any) {
      console.error('[MediaController] Error listing media:', error);
      res.status(500).json({ error: 'Failed to list media assets.' });
    }
  }

  public static async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { name, filename, mimeType, dataUrl, altText, caption, description } = req.body;

      if (!dataUrl) {
        res.status(400).json({ error: 'Data URL or file content is required.' });
        return;
      }

      let buffer: Buffer;
      let effectiveMime = mimeType || 'image/jpeg';
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

      if (match) {
        effectiveMime = match[1];
        buffer = Buffer.from(match[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl);
      }

      // Check max size: 25MB
      if (buffer.length > 25 * 1024 * 1024) {
        res.status(400).json({ error: 'File size exceeds maximum allowed upload size (25MB).' });
        return;
      }

      const originalName = filename || `${name || 'asset'}.jpg`;
      const stored = await storageAdapter.upload(buffer, originalName, effectiveMime);

      const mediaType = detectMediaType(effectiveMime, originalName);
      const mediaItem: MediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name || originalName.replace(/\.[^/.]+$/, ''),
        filename: stored.filename,
        originalFilename: originalName,
        url: stored.url,
        alt: altText || name || originalName,
        altText: altText || name || originalName,
        caption: caption || '',
        description: description || '',
        mediaType,
        mimeType: effectiveMime,
        fileSize: formatBytes(stored.sizeBytes),
        fileSizeBytes: stored.sizeBytes,
        source: 'upload',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await portfolioService.addMedia(mediaItem);

      // Append to draft media collection
      const draft = await portfolioService.getDraft();
      await portfolioService.saveDraft({ ...draft, media: [mediaItem, ...(draft.media || [])] });

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'UPLOAD_MEDIA',
        resource: mediaItem.name,
        details: { mediaId: mediaItem.id, url: mediaItem.url },
        ip: req.ip
      });

      res.status(201).json(mediaItem);
    } catch (error: any) {
      console.error('[MediaController] Media upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload media asset.' });
    }
  }

  public static async updateMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await portfolioService.updateMedia(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Media asset not found.' });
        return;
      }

      // Sync into working draft
      const draft = await portfolioService.getDraft();
      const newMediaList = (draft.media || []).map((m) => (m.id === id ? updated : m));
      await portfolioService.saveDraft({ ...draft, media: newMediaList });

      res.json(updated);
    } catch (error: any) {
      console.error('[MediaController] Error updating media item:', error);
      res.status(500).json({ error: 'Failed to update media item.' });
    }
  }

  public static async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const mediaList = await portfolioService.getMedia();
      const target = mediaList.find((m) => m.id === id);

      if (!target) {
        res.status(404).json({ error: 'Media asset not found.' });
        return;
      }

      // Safe deletion: remove from storage adapter
      if (target.url) {
        await storageAdapter.delete(target.url);
      }

      await portfolioService.deleteMedia(id);

      // Remove from draft media
      const draft = await portfolioService.getDraft();
      const filtered = (draft.media || []).filter((m) => m.id !== id);
      await portfolioService.saveDraft({ ...draft, media: filtered });

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'DELETE_MEDIA',
        resource: target.name,
        details: { mediaId: id, url: target.url },
        ip: req.ip
      });

      res.json({ success: true, message: `Media asset "${target.name}" deleted successfully.` });
    } catch (error: any) {
      console.error('[MediaController] Error deleting media:', error);
      res.status(500).json({ error: 'Failed to delete media asset.' });
    }
  }

  public static async replaceMedia(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { newUrl, filename, mimeType, dataUrl } = req.body;

      const mediaList = await portfolioService.getMedia();
      const existing = mediaList.find((m) => m.id === id);

      if (!existing) {
        res.status(404).json({ error: 'Media record not found.' });
        return;
      }

      let targetUrl = newUrl;

      if (dataUrl) {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        const effectiveMime = match ? match[1] : (mimeType || 'image/jpeg');
        const buffer = match ? Buffer.from(match[2], 'base64') : Buffer.from(dataUrl);
        const orig = filename || `${existing.name}-replaced.jpg`;
        const stored = await storageAdapter.upload(buffer, orig, effectiveMime);
        targetUrl = stored.url;
      }

      if (!targetUrl) {
        res.status(400).json({ error: 'New media URL or file data is required.' });
        return;
      }

      const oldUrl = existing.url;
      const updatedMedia = await portfolioService.updateMedia(id, {
        url: targetUrl,
        updatedAt: new Date().toISOString()
      });

      // Propagate replacement through working Draft
      const draft = await portfolioService.getDraft();
      let updatedPersonal = draft.personal;
      if (draft.personal.avatarUrl === oldUrl) {
        updatedPersonal = { ...draft.personal, avatarUrl: targetUrl };
      }

      const updatedProjects = draft.projects.map((proj) => {
        let img = proj.imageUrl === oldUrl ? targetUrl : proj.imageUrl;
        let gallery = proj.galleryImages?.map((g: string) => (g === oldUrl ? targetUrl : g));
        return { ...proj, imageUrl: img, galleryImages: gallery };
      });

      await portfolioService.saveDraft({
        ...draft,
        personal: updatedPersonal,
        projects: updatedProjects
      });

      await portfolioService.addAuditLog({
        userId: authReq.user?.id,
        userEmail: authReq.user?.email,
        action: 'REPLACE_MEDIA',
        resource: existing.name,
        details: { mediaId: id, oldUrl, newUrl: targetUrl },
        ip: req.ip
      });

      res.json({
        success: true,
        message: `Asset "${existing.name}" replaced everywhere with ${targetUrl}`,
        media: updatedMedia
      });
    } catch (error: any) {
      console.error('[MediaController] Error replacing media asset:', error);
      res.status(500).json({ error: error.message || 'Failed to replace media asset.' });
    }
  }
}
