export const errorHandler = (err, req, res, next) => {
  // Always log the full error details to the server console (includes stack trace and raw message)
  console.error("🔥 [ERROR]", err);

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Handle specific MongoDB/Mongoose errors to return safe, client-friendly messages

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    return res.status(404).json({ success: false, error: message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered. This resource already exists.";
    return res.status(400).json({ success: false, error: message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({ success: false, error: message });
  }

  // Handle CSRF Token errors
  if (err.code === "EBADCSRFTOKEN") {
    console.error("CSRF Debug - Server validation failed:", {
      nodeEnv: process.env.NODE_ENV,
      cookiePresent: !!req.cookies?.["x-csrf-token"],
      cookieValue: req.cookies?.["x-csrf-token"],
      headerPresent: !!req.headers?.["x-csrf-token"],
      headerValue: req.headers?.["x-csrf-token"],
      origin: req.headers?.origin,
      userAgent: req.headers?.["user-agent"],
    });
    return res.status(403).json({ success: false, error: "Invalid or missing CSRF token" });
  }

  // Check for status codes attached to the error object by our code
  const statusCode = err.status || err.statusCode || 500;

  // For generic 500 errors, mask the real message to avoid leaking internals
  // For client errors (400-499), it's generally safe to send the message if one was explicitly provided
  const isClientError = statusCode >= 400 && statusCode < 500;
  
  const responseMessage = isClientError 
    ? (error.message || "Bad Request") 
    : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: responseMessage
    // Stack trace is deliberately omitted to prevent leaking internal paths
  });
};
