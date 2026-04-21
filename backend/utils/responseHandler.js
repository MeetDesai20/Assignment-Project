/**
 * Error handler utility
 */
const handleError = (res, error, statusCode = 500, message = 'An error occurred') => {
  console.error('Error:', error);
  return res.status(statusCode).json({
    success: false,
    message: error.message || message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};

/**
 * Success response utility
 */
const handleSuccess = (res, data, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Validation error handler
 */
const handleValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array(),
  });
};

module.exports = {
  handleError,
  handleSuccess,
  handleValidationError,
};
