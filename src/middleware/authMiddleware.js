const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  // This will surface misconfiguration early when the app starts.
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET is not set in environment variables.');
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  // #region agent log
  if (!token) {
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authMiddleware.js', message: 'auth check', data: { outcome: 'noToken', path: req.path }, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => {});
    return res.status(401).json({ message: 'Authentication token missing' });
  }
  // #endregion
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authMiddleware.js', message: 'auth check', data: { outcome: 'ok', path: req.path }, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => {});
    // #endregion
    return next();
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authMiddleware.js', message: 'auth check', data: { outcome: 'invalid', path: req.path, errMessage: err.message }, timestamp: Date.now(), hypothesisId: 'H3' }) }).catch(() => {});
    // #endregion
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

