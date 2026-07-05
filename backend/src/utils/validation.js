import mongoose from "mongoose";

/**
 * Checks if a string is a valid MongoDB ObjectId.
 */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Express middleware to validate req.params.id (or other ID fields).
 */
export const validateIdParam = (paramName = "id") => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({ message: `Invalid ${paramName} format` });
  }
  next();
};

/**
 * Coerces and validates pagination parameters.
 * Limits the maximum page size to 50.
 */
export const validatePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  
  if (limit > 50) limit = 50;

  req.query.page = page;
  req.query.limit = limit;
  next();
};

/**
 * Strips out any sorting fields not in the allowed list.
 */
export const whitelistSort = (allowedFields) => (req, res, next) => {
  if (req.query.sort) {
    const sorts = req.query.sort.split(",");
    const validSorts = sorts.filter(sortField => {
      // Allow prefix '-' for descending sorts
      const cleanField = sortField.startsWith("-") ? sortField.substring(1) : sortField;
      return allowedFields.includes(cleanField);
    });
    req.query.sort = validSorts.join(",") || allowedFields[0]; // fallback to default
  }
  next();
};

/**
 * Extracts only the permitted fields from the source object.
 * Useful for preventing mass assignment from req.body.
 */
export const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};
