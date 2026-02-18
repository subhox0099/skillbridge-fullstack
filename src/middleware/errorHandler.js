// Centralized error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err);

  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'File size exceeds limit';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    message = 'Unexpected field or file type';
  }

  res.status(status).json({
    message,
  });
};

module.exports = errorHandler;

