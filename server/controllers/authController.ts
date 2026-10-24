import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, passkey } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!email || !passkey) {
      res.status(400).json({ error: 'Email and administrator passkey are required.' });
      return;
    }

    const result = await authService.login(email, passkey, ip, userAgent);

    if (result.success && result.token && result.user) {
      const cookieOptions = authService.getCookieOptions();
      res.cookie('akram_studio_session', result.token, cookieOptions);
      res.cookie('studio_session', result.token, cookieOptions);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
        expiresAt: result.expiresAt
      });
    } else {
      res.status(401).json({
        error: result.error || 'Authentication failed. Invalid email or passkey.'
      });
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.akram_studio_session || req.cookies?.studio_session;

    let token = cookieToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      await authService.logout(token);
    }

    res.clearCookie('akram_studio_session', { path: '/' });
    res.clearCookie('studio_session', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
  }

  public static async session(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.akram_studio_session || req.cookies?.studio_session;

    let token = cookieToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      res.json({ authenticated: false });
      return;
    }

    const sess = await authService.verifySession(token);
    if (!sess) {
      res.clearCookie('akram_studio_session', { path: '/' });
      res.clearCookie('studio_session', { path: '/' });
      res.json({ authenticated: false });
      return;
    }

    res.json({
      authenticated: true,
      user: sess.user,
      expiresAt: sess.expiresAt
    });
  }

  public static async me(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    res.json({
      authenticated: true,
      user: authReq.user,
      sessionId: authReq.sessionId
    });
  }
}
