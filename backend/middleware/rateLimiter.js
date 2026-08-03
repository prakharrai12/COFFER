// Lightweight in-memory rate limiter middleware for sensitive authentication & password endpoints

const rateLimitStore = new Map();

/**
 * Creates an Express middleware for rate limiting requests based on IP address.
 * @param {Object} options 
 * @param {number} options.windowMs - Time window in milliseconds (default 15 mins)
 * @param {number} options.max - Max requests per windowMs (default 20)
 * @param {string} options.message - Custom error message when limit exceeded
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 30,
  message = 'Too many requests from this IP. Please try again later after 15 minutes.'
} = {}) => {
  return (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${clientIp}`;
    const now = Date.now();

    const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitStore.set(key, record);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({ error: message, retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000) });
    }

    next();
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Rate limit exceeded for authentication requests. Please try again later.'
});
