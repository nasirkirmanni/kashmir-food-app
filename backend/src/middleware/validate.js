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
      // Map Zod errors to a clean, consistent format
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details
      });
    }
    next(error);
  }
};
