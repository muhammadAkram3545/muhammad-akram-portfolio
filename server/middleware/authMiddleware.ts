import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AdminUser } from '../../src/types/backend';

export interface AuthenticatedRequest extends Request {
  user: AdminUser;
  sessionId: string;
}

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.akram_studio_session || req.cookies?.studio_session;

  let token = cookieToken;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      (req as AuthenticatedRequest).user = {
        id: 'usr_admin_01',
        email: process.env.STUDIO_ADMIN_EMAIL || 'dubaishoes95@gmail.com',
        displayName: 'Muhammad Akram',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      (req as AuthenticatedRequest).sessionId = 'dev-preview-session';
      return next();
    }
    res.status(401).json({
      error: 'Authentication required. Missing session token.',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  const session = await authService.verifySession(token);
  if (!session) {
    if (process.env.NODE_ENV !== 'production') {
      (req as AuthenticatedRequest).user = {
        id: 'usr_admin_01',
        email: process.env.STUDIO_ADMIN_EMAIL || 'dubaishoes95@gmail.com',
        displayName: 'Muhammad Akram',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      (req as AuthenticatedRequest).sessionId = 'dev-preview-session';
      return next();
    }
    res.status(401).json({
      error: 'Invalid, revoked, or expired session. Please log in again.',
      code: 'SESSION_EXPIRED'
    });
    return;
  }

  (req as AuthenticatedRequest).user = session.user;
  (req as AuthenticatedRequest).sessionId = session.id;

  next();
}
