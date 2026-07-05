import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireOwnerOrAdmin = (Model, userIdField = 'user') => async (req, res, next) => {
  const id = req.params.id;
  
  // 1. Validate ObjectId
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    // 2. Fetch resource
    const doc = await Model.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // 3. Check ownership
    const isOwner = doc[userIdField]?.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: Not owner or admin" });
    }

    // 4. Attach to request
    req.resource = doc;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during authorization" });
  }
};
