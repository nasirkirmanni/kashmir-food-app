import Redis from 'ioredis';

let redisClient = null;
let isRedisAvailable = false;

// We export a function to get the client instead of a static instance,
// so we can lazily initialize it and handle failovers cleanly.
export const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) {
          console.warn('[REDIS] Connection failed after 3 retries. Falling back to in-memory mode.');
          isRedisAvailable = false;
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // 100ms, 200ms, 300ms
      },
    });

    redisClient.on('connect', () => {
      console.log('[REDIS] Connected successfully.');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      console.warn(`[REDIS] Error: ${err.message}`);
      isRedisAvailable = false;
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
    });

    redisClient.on('end', () => {
      isRedisAvailable = false;
    });

  } catch (err) {
    console.error(`[REDIS] Initialization error: ${err.message}`);
    isRedisAvailable = false;
  }

  return redisClient;
};

// Check if redis is currently healthy and active
export const isRedisHealthy = () => {
  return isRedisAvailable;
};
