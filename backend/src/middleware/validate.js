import { ZodError } from 'zod';

/**
 * Universal validation middleware.
 * Expects an object containing Zod schemas for { body, query, params }.
 * 
 * Execution Order Rule: 
 * validate -> authenticate -> rate limit -> controller
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // zod v4 renamed `.errors` -> `.issues`; fall back to `.errors` for v3.
      const issues = error.issues || error.errors || [];
      const details = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        // Surface a human-readable message so clients (which read `message`)
        // show the actual reason instead of a generic "Request failed".
        message: details[0]?.message || "Validation failed",
        details
      });
    }
    next(error);
  }
};
