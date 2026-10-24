import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolioController';
import { AuthController } from '../controllers/authController';
import { MediaController } from '../controllers/mediaController';
import { StatusController } from '../controllers/statusController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// 1. SYSTEM HEALTH & DIAGNOSTICS
// ==========================================
router.get('/status', StatusController.getStatus);

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/session', AuthController.session);
router.get('/auth/me', requireAdminAuth, AuthController.me);

// ==========================================
// 3. PUBLIC PORTFOLIO
// ==========================================
router.get('/portfolio/published', PortfolioController.getPublished);

// ==========================================
// 4. PROTECTED DRAFT & PUBLISH (STUDIO)
// ==========================================
router.get('/portfolio/draft', requireAdminAuth, PortfolioController.getDraft);
router.put('/portfolio/draft', requireAdminAuth, PortfolioController.saveDraft);
router.post('/portfolio/draft', requireAdminAuth, PortfolioController.saveDraft); // Allow POST as alias
router.post('/portfolio/publish', requireAdminAuth, PortfolioController.publish);
router.post('/portfolio/discard', requireAdminAuth, PortfolioController.discardDraft);

// ==========================================
// 5. VERSION HISTORY
// ==========================================
router.get('/portfolio/versions', requireAdminAuth, PortfolioController.getVersions);
router.get('/portfolio/versions/:id', requireAdminAuth, PortfolioController.getVersionById);
router.post('/portfolio/versions/:id/restore', requireAdminAuth, PortfolioController.restoreVersion);

// ==========================================
// 6. MEDIA VAULT & STORAGE
// ==========================================
router.get('/media', requireAdminAuth, MediaController.getMedia);
router.post('/media/upload', requireAdminAuth, MediaController.uploadMedia);
router.put('/media/:id', requireAdminAuth, MediaController.updateMedia);
router.delete('/media/:id', requireAdminAuth, MediaController.deleteMedia);
router.post('/media/:id/replace', requireAdminAuth, MediaController.replaceMedia);

export default router;
