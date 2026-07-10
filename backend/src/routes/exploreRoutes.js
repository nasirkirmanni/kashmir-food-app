import express from "express";
import { getExploreData } from "../controllers/exploreController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, getExploreData);

export default router;
