const ApiError = require('../utils/ApiError');

const adminSecretMiddleware = (req, res, next) => {
  const secretKey = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY;

  if (!secretKey || secretKey !== expectedSecret) {
    return next(
      new ApiError(403, 'Forbidden: Invalid or missing admin secret key')
    );
  }

  next();
};

module.exports = adminSecretMiddleware;
