import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { createToken } from "../utils/createToken.js";
import { protect } from "../middleware/auth.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

const router = express.Router();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." 
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already exists" });
      } else {
        // If unverified, we can update their OTP and resend
        const otp = generateOtp();
        existingUser.otp = otp;
        existingUser.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        existingUser.password = password; // update password just in case
        existingUser.name = name;
        await existingUser.save();
        
        // Do not await email sending to prevent hanging the HTTP response
        sendOtpEmail(email, otp).catch(console.error);
        return res.status(201).json({ message: "OTP sent to email", requiresOtp: true });
      }
    }

    const otp = generateOtp();
    const user = await User.create({ 
      name, 
      email, 
      password, 
      isVerified: false,
      otp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000 
    });

    // Do not await email sending to prevent hanging the HTTP response
    sendOtpEmail(email, otp).catch(console.error);

    res.status(201).json({
      message: "OTP sent to email",
      requiresOtp: true
    });
  })
);

router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = createToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      // Re-send OTP if they try to log in but aren't verified yet
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
      await user.save();
      
      // Do not await email sending to prevent hanging the HTTP response
      sendOtpEmail(email, otp).catch(console.error);
      return res.status(403).json({ message: "Please verify your email first", requiresOtp: true });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
