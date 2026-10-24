import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Determine client identifier (IP address or proxy header)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || '127.0.0.1';

    const now = Date.now();
    const existing = store.get(ip);

    if (!existing || existing.resetAt <= now) {
      store.set(ip, {
        count: 1,
        resetAt: now + options.windowMs
      });
      return next();
    }

    if (existing.count >= options.max) {
      const waitSeconds = Math.ceil((existing.resetAt - now) / 1000);
      return res.status(429).json({
        error: options.message || 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: waitSeconds
      });
    }

    existing.count += 1;
    next();
  };
}

// Preset rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // 60 uploads
  message: 'Upload rate limit reached. Please wait before uploading more media.'
});

export const mutationRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 120, // 120 requests
  message: 'Studio mutation rate limit exceeded. Please wait a moment.'
});
