import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'rl',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1
    });
  }
};

export { rateLimiterMiddleware as rateLimiter };
