import express from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { processEvent } from "../utils/explorer.js";

const router = express.Router();

router.post(
  "/view",
  protect,
  asyncHandler(async (req, res) => {
    const { action, entityType, entityId } = req.body;
    
    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }
    
    const xpPayload = await processEvent(req.user, action, entityType, entityId);
    
    res.status(200).json(xpPayload);
  })
);

export default router;
