import express from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get(
  "/favorites",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
      .populate("favorites.item")
      .select("favorites");

    res.json(user?.favorites || []);
  })
);

router.post(
  "/favorites",
  protect,
  asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.body;
    const itemTypeModel = itemType === "dish" ? "Dish" : "Restaurant";
    const user = await User.findById(req.user._id);

    const exists = user.favorites.some(
      (favorite) =>
        favorite.item.toString() === itemId && favorite.itemType === itemType
    );

    if (!exists) {
      user.favorites.push({ item: itemId, itemType, itemTypeModel });
      await user.save();
    }

    res.status(201).json(user.favorites);
  })
);

router.delete(
  "/favorites",
  protect,
  asyncHandler(async (req, res) => {
    const { itemId, itemType } = req.body;
    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter(
      (favorite) =>
        !(favorite.item.toString() === itemId && favorite.itemType === itemType)
    );

    await user.save();
    res.json(user.favorites);
  })
);

export default router;
