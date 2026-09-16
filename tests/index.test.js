// tests/index.test.js
const { authMiddleware } = require('../src/authMiddleware');
const SlidingWindowRateLimiter = require('../src/rateLimiter');
const BatchQueue = require('../src/queue');

describe('Interview Debugging Challenge Suite', () => {

  // TEST 1: Auth Middleware Error Handling
  test('1. AuthMiddleware should return 401 when token is invalid or expired', async () => {
    const req = { headers: { authorization: 'Bearer expired-jwt' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Execute middleware
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });

  // TEST 2: Rate Limiter Window Eviction
  test('2. RateLimiter should allow requests again after window expires', async () => {
    const limiter = new SlidingWindowRateLimiter(1000, 2); // 1 sec window, max 2 reqs

    expect(limiter.isAllowed('127.0.0.1')).toBe(true);
    expect(limiter.isAllowed('127.0.0.1')).toBe(true);
    expect(limiter.isAllowed('127.0.0.1')).toBe(false); // Hit limit

    // Wait 1.1s for window to clear
    await new Promise((res) => setTimeout(res, 1100));

    // Should allow requests again
    expect(limiter.isAllowed('127.0.0.1')).toBe(true);
  });

  // TEST 3: Batch Queue Concurrency
  test('3. BatchQueue should not lose items pushed concurrently during batch flush', async () => {
    const mockWorker = jest.fn().mockImplementation(async () => {
      await new Promise((res) => setTimeout(res, 200)); // Simulates slow DB save
    });

    const queue = new BatchQueue(2, mockWorker);

    // Push 2 items to trigger flush
    const p1 = queue.push('item1');
    const p2 = queue.push('item2');

    // Push 3rd item while flush is currently running
    await new Promise((res) => setTimeout(res, 50)); 
    const p3 = queue.push('item3');

    await Promise.all([p1, p2, p3]);

    // Force final flush
    await queue.flush();

    expect(queue.processedCount).toBe(3);
  });
});