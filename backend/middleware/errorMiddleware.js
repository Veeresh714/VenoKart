// Runs when a request hits a URL that doesn't match ANY route we've defined.
// e.g. GET /api/bananas -> nobody handles this -> we build a 404 error
// and pass it forward to errorHandler using next(error).
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// This is a SPECIAL kind of Express middleware: it takes 4 arguments
// (err, req, res, next) instead of 3. Express recognizes this signature
// and treats it as an error handler, calling it whenever next(error) is used
// ANYWHERE in the app, or an error is thrown inside an async controller
// (that we wrap with asyncHandler, see below).
export const errorHandler = (err, req, res, next) => {
  // Sometimes an error comes in with status 200 (meaning nobody set a
  // proper error status) - default to 500 (Internal Server Error) in that case.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose "CastError" happens when an invalid MongoDB ObjectId is used,
  // e.g. GET /api/products/123 where "123" isn't a valid Mongo ID.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose validation errors (e.g. missing required field) come as
  // err.name === "ValidationError" with details in err.errors.
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // MongoDB duplicate key error (e.g. registering with an email that already exists).
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(", ");
    message = `${field} already exists`;
  }

  res.status(statusCode).json({
    message,
    // Only include the stack trace in development mode - never expose
    // internal file paths/code details to users in production.
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// A wrapper for async controller functions so we DON'T have to write
// try/catch in every single one. If the wrapped function throws/rejects,
// this catches it and forwards it to our errorHandler via next(error).
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
