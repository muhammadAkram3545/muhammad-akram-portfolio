import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './src/server/db/databaseEngine';
import { authManager } from './src/server/auth/authManager';
import { storageAdapter, detectMediaType, formatBytes } from './src/server/storage/storageManager';
import { validatePortfolioForPublish } from './src/server/validation/validator';
import { PortfolioData, MediaItem } from './src/types/portfolio';
import { VersionHistoryItem } from './src/types/backend';
import apiRoutes from './server/routes/apiRoutes';
import { isSupabaseConfigured, testSupabaseConnection } from './server/config/supabase';

dotenv.config();

const app = express();
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const PORT = process.env.PORT || process.env.APP_PORT || (portArg ? parseInt(portArg.split('=')[1], 10) : 3000);
const isProduction = process.env.NODE_ENV === 'production';

// Express Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory serving
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Mount Modular API Routes (MySQL Relational + Local JSON Architecture)
app.use('/api', apiRoutes);

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: any;
  sessionToken?: string;
}

function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token =
    req.cookies?.studio_session ||
    req.cookies?.akram_studio_session ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    if (!isProduction || process.env.NODE_ENV !== 'production') {
      req.user = {
        id: 'usr_admin_01',
        email: process.env.STUDIO_ADMIN_EMAIL || 'dubaishoes95@gmail.com',
        displayName: 'Muhammad Akram',
        role: 'super_admin'
      };
      req.sessionToken = 'dev-preview-token';
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Studio administrator authentication required.' });
  }

  const session = authManager.validateSession(token);
  if (!session) {
    if (!isProduction || process.env.NODE_ENV !== 'production') {
      req.user = {
        id: 'usr_admin_01',
        email: process.env.STUDIO_ADMIN_EMAIL || 'dubaishoes95@gmail.com',
        displayName: 'Muhammad Akram',
        role: 'super_admin'
      };
      req.sessionToken = 'dev-preview-token';
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid.' });
  }

  req.user = session.user;
  req.sessionToken = token;
  next();
}

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Backend Health & Persistence Status
app.get('/api/status', (req: Request, res: Response) => {
  const stats = db.getStats();
  const token =
    req.cookies?.studio_session ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const session = token ? authManager.validateSession(token) : null;

  res.json({
    status: 'connected',
    database: {
      provider: 'local-file',
      connected: true,
      recordsCount: stats
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER || 'local-disk',
      connected: true
    },
    auth: {
      mode: 'session-cookie-bearer',
      authenticated: !!session,
      userEmail: session?.user?.email,
      expiresAt: session?.expiresAt
    }
  });
});

// PUBLIC PORTFOLIO: strictly published content only
app.get('/api/portfolio/published', (req: Request, res: Response) => {
  try {
    const published = db.getPublished();
    // Return sanitized portfolio content for visitors (no draft/private internal logs)
    res.json(published);
  } catch (error: any) {
    console.error('[API] Error fetching published portfolio:', error);
    res.status(500).json({ error: 'Failed to load published portfolio.' });
  }
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, passkey } = req.body;
    if (!passkey) {
      return res.status(400).json({ error: 'Access passkey is required.' });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = authManager.login(email || 'admin@muhammadakram.dev', passkey, ip);

    // Set secure HTTP-only cookie
    res.cookie('studio_session', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      token: result.token,
      user: result.user,
      expiresAt: result.expiresAt
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Authentication failed.' });
  }
});

// Check Session
app.get('/api/auth/session', (req: Request, res: Response) => {
  const token =
    req.cookies?.studio_session ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.json({ authenticated: false });
  }

  const session = authManager.validateSession(token);
  if (!session) {
    res.clearCookie('studio_session', { path: '/' });
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: session.user,
    expiresAt: session.expiresAt
  });
});

// Logout
app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const token =
    req.cookies?.studio_session ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (token) {
    authManager.logout(token, req.ip);
  }

  res.clearCookie('studio_session', { path: '/' });
  res.json({ success: true });
});

// Change Password
app.post('/api/auth/change-password', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    authManager.changePassword(req.user.id, oldPassword, newPassword, req.ip);
    res.json({ success: true, message: 'Studio passkey updated successfully.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update passkey.' });
  }
});

// ==========================================
// 3. PROTECTED PORTFOLIO DRAFT & PUBLISH
// ==========================================

// Save Draft (Autosave target) - supports both PUT and POST
app.all('/api/portfolio/draft', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    return requireAdminAuth(req as AuthenticatedRequest, res, () => {
      try {
        const draft = db.getDraft();
        res.json(draft);
      } catch (error: any) {
        res.status(500).json({ error: 'Failed to retrieve draft portfolio.' });
      }
    });
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    return requireAdminAuth(req as AuthenticatedRequest, res, () => {
      try {
        const updatedDraft: PortfolioData = req.body;
        if (!updatedDraft || !updatedDraft.personal) {
          return res.status(400).json({ error: 'Invalid portfolio data payload.' });
        }

        updatedDraft.lastUpdated = new Date().toISOString();
        db.saveDraft(updatedDraft);

        db.addAuditLog({
          userId: (req as AuthenticatedRequest).user.id,
          userEmail: (req as AuthenticatedRequest).user.email,
          action: 'SAVE_DRAFT',
          resource: 'Portfolio Draft',
          ip: req.ip
        });

        res.json({
          success: true,
          lastUpdated: updatedDraft.lastUpdated
        });
      } catch (error: any) {
        console.error('[API] Error saving draft:', error);
        res.status(500).json({ error: 'Failed to save draft.' });
      }
    });
  }
  next();
});

// Validate & Publish Draft
app.post('/api/portfolio/publish', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const payloadData: PortfolioData = req.body.data || db.getDraft();
    const releaseNotes: string = req.body.releaseNotes || 'Production content release';

    // 1. Validation check
    const validation = validatePortfolioForPublish(payloadData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Content validation failed. Please address errors before publishing.',
        validation
      });
    }

    // 2. Prepare published record
    const nextVersionNumber = (payloadData.version || 1) + 1;
    const publishedRecord: PortfolioData = {
      ...payloadData,
      version: nextVersionNumber,
      lastUpdated: new Date().toISOString()
    };

    // 3. Save to database
    db.savePublished(publishedRecord);
    db.saveDraft(publishedRecord);

    // 4. Create Immutable Version Record
    const versionRecord: VersionHistoryItem = {
      id: `ver-${Date.now()}`,
      versionNumber: nextVersionNumber,
      versionLabel: `v1.0.${nextVersionNumber} (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`,
      author: {
        id: req.user.id,
        name: req.user.displayName,
        email: req.user.email
      },
      timestamp: new Date().toISOString(),
      summary: releaseNotes,
      stats: {
        sectionsCount: publishedRecord.sections.length,
        projectsCount: publishedRecord.projects.length,
        skillsCount: publishedRecord.skills.length,
        servicesCount: publishedRecord.services.length,
        mediaCount: publishedRecord.media.length
      },
      snapshot: publishedRecord
    };

    db.addVersion(versionRecord);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
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
    console.error('[API] Publish error:', error);
    res.status(500).json({ error: error.message || 'Failed to publish portfolio.' });
  }
});

// Discard changes and reset draft to published
app.post('/api/portfolio/discard', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const published = db.getPublished();
    db.saveDraft(published);
    res.json({ success: true, draft: published });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset draft.' });
  }
});

// ==========================================
// 4. VERSION HISTORY
// ==========================================

// List Versions
app.get('/api/portfolio/versions', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const versions = db.getVersions();
    // Return versions without full snapshots for lightweight listing
    const summaryList = versions.map(({ snapshot, ...rest }) => rest);
    res.json(summaryList);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve version history.' });
  }
});

// Get Version with snapshot
app.get('/api/portfolio/versions/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const version = db.getVersionById(req.params.id);
  if (!version) {
    return res.status(404).json({ error: 'Version record not found.' });
  }
  res.json(version);
});

// Restore Version (creates a new working draft from the version snapshot)
app.post('/api/portfolio/versions/:id/restore', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const version = db.getVersionById(req.params.id);
    if (!version) {
      return res.status(404).json({ error: 'Version record not found.' });
    }

    const restoredDraft: PortfolioData = {
      ...version.snapshot,
      lastUpdated: new Date().toISOString()
    };

    db.saveDraft(restoredDraft);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'RESTORE_VERSION',
      resource: version.versionLabel,
      details: { versionId: version.id },
      ip: req.ip
    });

    res.json({
      success: true,
      message: `Version ${version.versionLabel} restored into current draft.`,
      restoredDraft
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to restore version.' });
  }
});

// ==========================================
// 4.5. AUTOMATIC URL PREVIEW & THUMBNAIL RETRIEVAL
// ==========================================
app.post('/api/projects/fetch-url-preview', async (req: Request, res: Response) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ success: false, error: 'A valid project URL is required.' });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL format.' });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.local')
    ) {
      return res.status(400).json({ success: false, error: 'Private or local IP addresses cannot be previewed.' });
    }

    let html = '';
    let previewEmbedAllowed = true;
    let fetchError: string | null = null;

    try {
      const response = await fetch(parsedUrl.href, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000)
      });

      const xFrame = response.headers.get('x-frame-options');
      const csp = response.headers.get('content-security-policy');
      if (
        (xFrame && (xFrame.toLowerCase().includes('deny') || xFrame.toLowerCase().includes('sameorigin'))) ||
        (csp && csp.toLowerCase().includes('frame-ancestors'))
      ) {
        previewEmbedAllowed = false;
      }

      html = await response.text();
    } catch (e: any) {
      fetchError = e.message || 'Connection timed out or website is unreachable';
    }

    let title: string | null = null;
    let description: string | null = null;
    let ogImage: string | null = null;
    const images: string[] = [];

    if (html) {
      const ogTitleMatch =
        html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = ogTitleMatch ? ogTitleMatch[1].trim() : titleTagMatch ? titleTagMatch[1].trim() : null;

      const ogDescMatch =
        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      description = ogDescMatch ? ogDescMatch[1].trim() : null;

      const ogImgMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
      if (ogImgMatch && ogImgMatch[1]) {
        try {
          const resolved = new URL(ogImgMatch[1], parsedUrl.href).href;
          ogImage = resolved;
          images.push(resolved);
        } catch {}
      }

      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match: RegExpExecArray | null;
      while ((match = imgRegex.exec(html)) !== null && images.length < 10) {
        const src = match[1];
        if (src && !src.startsWith('data:') && !src.endsWith('.svg') && !src.includes('pixel') && !src.includes('tracker')) {
          try {
            const resolved = new URL(src, parsedUrl.href).href;
            if (!images.includes(resolved)) {
              images.push(resolved);
            }
          } catch {}
        }
      }

      if (html.includes('__test=') || html.includes('slowAES') || html.includes('challenge-platform')) {
        previewEmbedAllowed = false;
        if (!title || title === 'No title') {
          title = parsedUrl.hostname;
        }
      }
    }

    const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${parsedUrl.href}`;

    return res.json({
      success: !!html && (images.length > 0 || !!title),
      url: parsedUrl.href,
      title: title || parsedUrl.hostname,
      description: description || '',
      ogImage: ogImage || images[0] || null,
      images,
      screenshotUrl,
      previewEmbedAllowed,
      warning: fetchError
        ? `Website could not be automatically scraped (${fetchError}). Please upload a thumbnail or cover photo manually.`
        : images.length === 0
        ? 'Website has bot restrictions or lacks OpenGraph image meta tags. You can upload a screenshot or cover photo manually.'
        : undefined
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process website preview request.'
    });
  }
});

// ==========================================
// 5. MEDIA VAULT & STORAGE
// ==========================================

// List Media Items
app.get('/api/media', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = db.getMedia();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list media assets.' });
  }
});

// Upload Media Asset
app.post('/api/media/upload', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, filename, mimeType, dataUrl, altText, caption, description, category } = req.body;

    if (!dataUrl) {
      return res.status(400).json({ error: 'Data URL or file content is required.' });
    }

    // Extract base64 buffer from data URL
    let buffer: Buffer;
    let effectiveMime = mimeType || 'image/jpeg';
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

    if (match) {
      effectiveMime = match[1];
      buffer = Buffer.from(match[2], 'base64');
    } else {
      buffer = Buffer.from(dataUrl);
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

    db.addMediaItem(mediaItem);

    // Also append to draft media list
    const draft = db.getDraft();
    db.saveDraft({ ...draft, media: [mediaItem, ...draft.media] });

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'UPLOAD_MEDIA',
      resource: mediaItem.name,
      details: { mediaId: mediaItem.id, url: mediaItem.url },
      ip: req.ip
    });

    res.status(201).json(mediaItem);
  } catch (error: any) {
    console.error('[API] Media upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload media asset.' });
  }
});

// Update Media Metadata
app.put('/api/media/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateMediaItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Media asset not found.' });
    }

    // Synchronize into working draft
    const draft = db.getDraft();
    const newMediaList = draft.media.map((m) => (m.id === req.params.id ? updated : m));
    db.saveDraft({ ...draft, media: newMediaList });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update media item.' });
  }
});

// Replace Media Asset Everywhere
app.post('/api/media/:id/replace', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newUrl, filename, mimeType, dataUrl } = req.body;
    const mediaId = req.params.id;
    const existing = db.getMedia().find((m) => m.id === mediaId);

    if (!existing) {
      return res.status(404).json({ error: 'Media record not found.' });
    }

    let targetUrl = newUrl;

    // If new file binary provided, upload it
    if (dataUrl) {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      const effectiveMime = match ? match[1] : (mimeType || 'image/jpeg');
      const buffer = match ? Buffer.from(match[2], 'base64') : Buffer.from(dataUrl);
      const orig = filename || `${existing.name}-replaced.jpg`;
      const stored = await storageAdapter.upload(buffer, orig, effectiveMime);
      targetUrl = stored.url;
    }

    if (!targetUrl) {
      return res.status(400).json({ error: 'New media URL or binary data required.' });
    }

    const oldUrl = existing.url;
    const updatedMedia = db.updateMediaItem(mediaId, {
      url: targetUrl,
      updatedAt: new Date().toISOString()
    });

    // Propagate replacement through current Draft
    const draft = db.getDraft();
    let updatedPersonal = draft.personal;
    if (draft.personal.avatarUrl === oldUrl) {
      updatedPersonal = { ...draft.personal, avatarUrl: targetUrl };
    }

    const updatedProjects = draft.projects.map((proj) => {
      let img = proj.imageUrl === oldUrl ? targetUrl : proj.imageUrl;
      let gallery = proj.galleryImages?.map((g) => (g === oldUrl ? targetUrl : g));
      return { ...proj, imageUrl: img, galleryImages: gallery };
    });

    const updatedSections = draft.sections.map((sec) => {
      let bg = sec.backgroundImageUrl === oldUrl ? targetUrl : sec.backgroundImageUrl;
      let els = sec.elements?.map((el) => {
        if (el.content?.imageUrl === oldUrl) {
          return { ...el, content: { ...el.content, imageUrl: targetUrl } };
        }
        return el;
      });
      return { ...sec, backgroundImageUrl: bg, elements: els };
    });

    const updatedMediaList = draft.media.map((m) => (m.id === mediaId ? updatedMedia! : m));

    db.saveDraft({
      ...draft,
      personal: updatedPersonal,
      projects: updatedProjects,
      sections: updatedSections,
      media: updatedMediaList
    });

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'REPLACE_MEDIA',
      resource: existing.name,
      details: { mediaId, oldUrl, newUrl: targetUrl },
      ip: req.ip
    });

    res.json({
      success: true,
      updatedMedia,
      propagatedDraft: true
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to replace media asset.' });
  }
});

// Delete Media Asset
app.delete('/api/media/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id;
    const media = db.getMedia().find((m) => m.id === mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media asset not found.' });
    }

    db.deleteMediaItem(mediaId);

    // Also remove from draft media list
    const draft = db.getDraft();
    db.saveDraft({ ...draft, media: draft.media.filter((m) => m.id !== mediaId) });

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DELETE_MEDIA',
      resource: media.name,
      details: { mediaId },
      ip: req.ip
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete media asset.' });
  }
});

// Audit Log
app.get('/api/audit-log', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = db.getAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve audit log.' });
  }
});

// ==========================================
// 6. VITE SPA / PRODUCTION CLIENT SERVING
// ==========================================
async function startServer() {
  if (isSupabaseConfigured()) {
    try {
      console.log('[SERVER] Supabase configured. Checking connectivity...');
      const testResult = await testSupabaseConnection();
      console.log(`[SERVER] Supabase status: ${testResult.message}`);
    } catch (supErr: any) {
      console.error('[SERVER] Supabase connectivity check warning:', supErr.message || supErr);
    }
  } else {
    console.log('[SERVER] Supabase not configured in current environment. Operating with fallback storage engine.');
  }

  if (!isProduction) {
    // Development mode: Mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback to transform and serve index.html for client-side routes (SPA)
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production mode: Serve pre-built static bundle
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SERVER] Portfolio Full-Stack Application running on http://0.0.0.0:${PORT}`);
    console.log(`[SERVER] Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`[SERVER] Database: Persistent Transactional JSON (${path.resolve(process.cwd(), 'data', 'db')})`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[SERVER] Port ${PORT} already occupied.`);
    } else {
      console.error('[SERVER] Server error:', err);
    }
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Fatal startup error:', err);
  process.exit(1);
});
