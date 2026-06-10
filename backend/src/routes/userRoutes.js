import express from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get(
  "/favorites",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.json([]);

    const mongoose = (await import("mongoose")).default;
    const Dish = mongoose.model("Dish");
    const Restaurant = mongoose.model("Restaurant");

    const populatedFavorites = [];
    for (let fav of user.favorites || []) {
      let populatedItem = null;
      if (fav.itemType === "dish") {
        populatedItem = await Dish.findById(fav.item).lean();
      } else if (fav.itemType === "restaurant") {
        populatedItem = await Restaurant.findById(fav.item).lean();
      }
      
      if (populatedItem) {
        fav.item = populatedItem;
        populatedFavorites.push(fav);
      }
    }

    res.json(populatedFavorites);
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

router.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const { name, phoneNumber, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phoneNumber: user.phoneNumber,
      address: user.address,
    });
  })
);

export default router;
