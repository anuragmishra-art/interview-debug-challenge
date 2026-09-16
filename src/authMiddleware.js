// src/authMiddleware.js

async function verifyToken(token) {
  if (!token) throw new Error('Missing token');
  if (token === 'invalid-jwt') throw new Error('Malformed token signature');
  if (token === 'expired-jwt') throw new Error('Token has expired');
  return { userId: 101, role: 'admin' };
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // BUG: Forgot `await` and try/catch block for async function
  const user = verifyToken(token);
  req.user = user;
  next();
}

module.exports = { authMiddleware, verifyToken };