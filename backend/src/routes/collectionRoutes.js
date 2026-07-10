import express from "express";
import { getCollectionBySlug } from "../controllers/collectionController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:slug", optionalAuth, getCollectionBySlug);

export default router;
