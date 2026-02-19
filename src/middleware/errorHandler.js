// Centralized error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'File size exceeds limit';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    message = 'Unexpected field or file type';
  }
  // #region agent log
  fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'errorHandler.js', message: 'error handled', data: { status, message, errName: err.name, path: req.path }, timestamp: Date.now(), hypothesisId: 'H5' }) }).catch(() => {});
  // #endregion
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  res.status(status).json({ message });
};

module.exports = errorHandler;

