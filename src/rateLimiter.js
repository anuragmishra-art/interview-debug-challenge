// src/rateLimiter.js

class SlidingWindowRateLimiter {
  constructor(windowMs = 5000, maxRequests = 3) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map(); // ip -> Array<timestamps>
  }

  isAllowed(ip) {
    const now = Date.now();
    
    if (!this.hits.has(ip)) {
      this.hits.set(ip, []);
    }

    const timestamps = this.hits.get(ip);

    if (timestamps.length >= this.maxRequests) {
      return false;
    }

    timestamps.push(now);
    return true;
  }
}

module.exports = SlidingWindowRateLimiter;