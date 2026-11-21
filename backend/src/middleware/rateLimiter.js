import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// An IPv6 visitor holds a whole block of addresses; counting by single address would let them step
// round any limit. ipKeyGenerator counts by the block.
const ipKey = (req) => ipKeyGenerator(req.ip || '');
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisHealthy } from '../config/redis.js';
import { normalizeEmail, getAuthIpKey, getAuthAccountKey, getAuthCombinedKey } from '../utils/rateLimitKeys.js';
import { logRateLimitEvent } from '../utils/metrics.js';

// Simple in-memory fallback for authLimiter if Redis is down
const fallbackCache = new Map();

const standardHandler = (req, res, next, options) => {
  logRateLimitEvent({
    ip: req.ip,
    userId: req.user?._id?.toString(),
    email: req.body?.email,
    endpoint: req.originalUrl,
    limiterType: options.message?.limiterType || 'standard',
  });
  res.status(options.statusCode).json({
    error: "Too Many Requests",
    message: options.message?.text || "Rate limit exceeded. Please try again later.",
    retryAfter: Math.ceil(options.windowMs / 1000)
  });
};

const createLimiter = (options) => {
  const store = isRedisHealthy() 
    ? new RedisStore({ sendCommand: (...args) => getRedisClient().call(...args) })
    : undefined; // Falls back to express-rate-limit's built-in memory store

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
    store,
    keyGenerator: options.keyGenerator || ipKey,
    skip: options.skip || (() => false),
    handler: standardHandler,
    message: { text: options.message, limiterType: options.name },
    validate: { ip: false, default: true }
  });
};

// 1. Global Safety Limiter
export const globalSafetyLimiter = createLimiter({
  name: 'global_safety',
  windowMs: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MIN || 1) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || 5000),
  message: "Too many requests to the server, please try again later.",
  skip: (req) => req.originalUrl === '/api/health' || req.originalUrl === '/api/auth/csrf-token'
});

// 2. Public Limiter
export const publicLimiter = createLimiter({
  name: 'public',
  windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MIN || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || 100),
  message: "Too many unauthenticated requests from this IP, please try again later."
});

// 3. Authenticated Limiter
export const authenticatedLimiter = createLimiter({
  name: 'authenticated',
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_USER_WINDOW_MIN || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_USER_MAX || 1000),
  keyGenerator: (req) => req.user?._id?.toString() || ipKey(req),
  message: "Too many requests from this user, please try again later."
});

// 4. Endpoint-Specific Limiters
export const fileUploadLimiter = createLimiter({
  name: 'file_upload',
  windowMs: parseInt(process.env.RATE_LIMIT_FILE_UPLOAD_WINDOW_MIN || 60) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_FILE_UPLOAD_MAX || 20),
  keyGenerator: (req) => req.user?._id?.toString() || ipKey(req),
  message: "Upload limit exceeded. Please wait before uploading more files."
});

export const passwordResetLimiter = createLimiter({
  name: 'password_reset',
  windowMs: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MIN || 60) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_MAX || 3),
  keyGenerator: (req) => req.body?.email ? normalizeEmail(req.body.email) : ipKey(req),
  message: "Too many password reset attempts. Please check your email or try again later."
});

export const userActionLimiter = createLimiter({
  name: 'user_action',
  windowMs: parseInt(process.env.RATE_LIMIT_USER_ACTION_WINDOW_MIN || 1) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_USER_ACTION_MAX || 30),
  keyGenerator: (req) => req.user?._id?.toString() || ipKey(req),
  message: "You are performing actions too quickly. Please slow down."
});

export const registrationLimiter = createLimiter({
  name: 'registration',
  windowMs: parseInt(process.env.RATE_LIMIT_REGISTRATION_WINDOW_MIN || 60) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REGISTRATION_MAX || 5),
  message: "Too many accounts created from this IP. Please try again later."
});

// AI chat limiter, by role. Each tier's limiter is made once: a limiter made inside the request
// handler starts a fresh count every time, which on the in-memory store means no limit at all.
// Per hour by default; every figure can be set from the environment.
const AI_CHAT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_AI_CHAT_WINDOW_MIN || 60) * 60 * 1000;
const aiChatTier = (name, max) =>
  createLimiter({
    name: `ai_chat_${name}`,
    windowMs: AI_CHAT_WINDOW_MS,
    max,
    keyGenerator: (req) => `ai:${name}:${req.user?._id?.toString() || ipKey(req)}`,
    message: "You've asked Waza AI a lot of questions in a short time. Please wait a little before asking more."
  });
const AI_CHAT_LIMITERS = {
  admin: aiChatTier('admin', parseInt(process.env.RATE_LIMIT_AI_CHAT_MAX_ADMIN || 1000)),
  premium: aiChatTier('premium', parseInt(process.env.RATE_LIMIT_AI_CHAT_MAX_PREMIUM || 120)),
  free: aiChatTier('free', parseInt(process.env.RATE_LIMIT_AI_CHAT_MAX_FREE || 60)),
  guest: aiChatTier('guest', parseInt(process.env.RATE_LIMIT_AI_CHAT_MAX_GUEST || 30))
};

export const aiChatLimiter = (req, res, next) => {
  const role = req.user?.role;
  const tier = req.user?.isAdmin ? 'admin' : role === 'premium' ? 'premium' : role === 'agent' || role === 'user' ? 'free' : 'guest';
  return AI_CHAT_LIMITERS[tier](req, res, next);
};

// 5. Auth Limiter (Triple-Counter Exponential Backoff)
export const authLimiter = async (req, res, next) => {
  const ip = req.ip;
  const email = normalizeEmail(req.body?.email);
  
  const ipKey = getAuthIpKey(ip);
  const accountKey = getAuthAccountKey(email);
  const combinedKey = getAuthCombinedKey(ip, email);
  
  let attempts = 0;
  
  if (isRedisHealthy()) {
    const redis = getRedisClient();
    try {
      const results = await redis.multi()
        .incr(ipKey).expire(ipKey, 900) // 15 mins
        .incr(accountKey).expire(accountKey, 900)
        .incr(combinedKey).expire(combinedKey, 900)
        .exec();
        
      const ipAttempts = results[0][1];
      const accountAttempts = results[2][1];
      const combinedAttempts = results[4][1];
      
      attempts = Math.max(ipAttempts, accountAttempts, combinedAttempts);
    } catch (err) {
      console.warn(`[AUTH_LIMITER] Redis error: ${err.message}. Falling back.`);
    }
  } 
  
  // Fallback map if redis is down or threw error
  if (!attempts) {
    const now = Date.now();
    for (const [key, val] of fallbackCache.entries()) {
      if (now > val.expiresAt) fallbackCache.delete(key);
    }
    
    const getInc = (k) => {
      const data = fallbackCache.get(k) || { count: 0, expiresAt: now + 900000 };
      data.count++;
      fallbackCache.set(k, data);
      return data.count;
    };
    
    attempts = Math.max(getInc(ipKey), getInc(accountKey), getInc(combinedKey));
  }
  
  const threshold = parseInt(process.env.RATE_LIMIT_AUTH_THRESHOLD || 5);
  const rejectThreshold = parseInt(process.env.RATE_LIMIT_AUTH_REJECT_THRESHOLD || 15);
  
  if (attempts > rejectThreshold) {
    logRateLimitEvent({
      event: 'RATE_LIMIT_REJECT',
      ip, email, endpoint: req.originalUrl, limiterType: 'auth_reject', attemptCount: attempts
    });
    res.set('Retry-After', 900); // 15 mins
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Too many failed attempts. Account temporarily locked for security.",
      retryAfter: 900
    });
  }
  
  if (attempts > threshold) {
    const baseDelay = parseInt(process.env.RATE_LIMIT_AUTH_BASE_DELAY_MS || 1000);
    const maxDelay = parseInt(process.env.RATE_LIMIT_AUTH_MAX_DELAY_MS || 30000);
    const delay = Math.min(baseDelay * Math.pow(2, attempts - threshold - 1), maxDelay);
    
    logRateLimitEvent({
      event: 'RATE_LIMIT_DELAY',
      ip, email, endpoint: req.originalUrl, limiterType: 'auth_exponential_backoff', attemptCount: attempts, appliedDelayMs: delay
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  next();
};

export const resetAuthCounters = async (ip, emailRaw) => {
  const email = normalizeEmail(emailRaw);
  const ipKey = getAuthIpKey(ip);
  const accountKey = getAuthAccountKey(email);
  const combinedKey = getAuthCombinedKey(ip, email);
  
  if (isRedisHealthy()) {
    try {
      await getRedisClient().del(ipKey, accountKey, combinedKey);
    } catch (err) {
      console.warn(`[AUTH_LIMITER] Redis delete error: ${err.message}`);
    }
  } else {
    fallbackCache.delete(ipKey);
    fallbackCache.delete(accountKey);
    fallbackCache.delete(combinedKey);
  }
};
