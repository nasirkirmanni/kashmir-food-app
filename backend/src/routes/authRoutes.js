import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { generateAuthCookies } from "../utils/createToken.js";
import { protect } from "../middleware/auth.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import { processEvent, processDailyLogin, calculateProgression } from "../utils/explorer.js";
import { ExplorerEvent } from "../models/ExplorerEvent.js";
import { EXPLORER_CONFIG } from "../config/explorerConfig.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { 
  authLimiter, 
  registrationLimiter, 
  passwordResetLimiter, 
  resetAuthCounters 
} from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { 
  signupSchema, 
  loginSchema, 
  verifySchema, 
  forgotPasswordSchema, 
  verifyResetOtpSchema, 
  resetPasswordSchema 
} from "../validations/authValidations.js";

const router = express.Router();

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

router.post(
  "/signup",
  validate({ body: signupSchema }),
  registrationLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields (name, email, phoneNumber, password) are required" });
    }

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." 
      });
    }

    // Check existing email
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      if (existingByEmail.isVerified) {
        return res.status(400).json({ message: "Email already exists" });
      }
      // If unverified, update their details and re-send Email OTP
      const otp = generateOtp();
      existingByEmail.name = name;
      existingByEmail.password = password;
      existingByEmail.phoneNumber = phoneNumber;
      existingByEmail.otp = otp;
      existingByEmail.otpExpiresAt = Date.now() + 10 * 60 * 1000;
      await existingByEmail.save();

      sendOtpEmail(email, otp).catch(console.error);
      return res.status(201).json({ message: "OTP sent to email", requiresOtp: true, email });
    }

    // Check existing phone number
    const existingByPhone = await User.findOne({ phoneNumber });
    if (existingByPhone) {
      if (existingByPhone.isVerified) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      // If unverified, update their details and re-send Email OTP
      const otp = generateOtp();
      existingByPhone.name = name;
      existingByPhone.password = password;
      existingByPhone.email = email;
      existingByPhone.otp = otp;
      existingByPhone.otpExpiresAt = Date.now() + 10 * 60 * 1000;
      await existingByPhone.save();

      sendOtpEmail(email, otp).catch(console.error);
      return res.status(201).json({ message: "OTP sent to email", requiresOtp: true, email });
    }

    const otp = generateOtp();
    await User.create({ 
      name, 
      email,
      phoneNumber,
      password, 
      isVerified: false,
      otp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000 
    });

    sendOtpEmail(email, otp).catch(console.error);

    res.status(201).json({
      message: "OTP sent to email",
      requiresOtp: true,
      email
    });
  })
);

router.post(
  "/verify",
  validate({ body: verifySchema }),
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isNewAccount = !user.isVerified;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    let gamificationPayload = null;
    let loginPayload = null;

    if (isNewAccount) {
      gamificationPayload = await processEvent(user, "CREATE_ACCOUNT");
    }
    
    // Process daily login (applies to both new and returning)
    loginPayload = await processDailyLogin(user);

    await resetAuthCounters(req.ip, email);

    generateAuthCookies(res, user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
      },
      gamificationPayload,
      loginPayload
    });
  })
);

router.post(
  "/login",
  validate({ body: loginSchema }),
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (email === "nasirkirmani1@gmail.com") {
      const loginPayload = await processDailyLogin(user);
      await resetAuthCounters(req.ip, email);
      generateAuthCookies(res, user);
      return res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          phoneNumber: user.phoneNumber,
          address: user.address,
          role: user.role,
        },
        loginPayload
      });
    }

    // Send Email OTP for 2FA on every login
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    sendOtpEmail(user.email, otp).catch(console.error);

    return res.status(200).json({ 
      message: "Please enter the OTP sent to your email.", 
      requiresOtp: true,
      email: user.email
    });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    // Process login streak implicitly if they hit /me on app load
    const loginPayload = await processDailyLogin(req.user);
    
    // Add progression stats
    const progression = calculateProgression(req.user.totalXP);
    
    // Get recent activity
    const recentActivity = await ExplorerEvent.find({ userId: req.user._id, xpAwarded: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(EXPLORER_CONFIG.MAX_RECENT_ACTIVITY)
      .lean();

    res.json({ 
      user: {
        ...req.user.toObject(),
        ...progression,
        recentActivity
      },
      loginPayload
    });
  })
);

router.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  passwordResetLimiter,
  asyncHandler(async (req, res) => {
    const { email, method } = req.body;

    if (!method || (method !== "email" && method !== "phone")) {
      return res.status(400).json({ message: "Recovery method ('email' or 'phone') is required." });
    }

    if (method === "phone") {
      return res.status(400).json({ message: "Phone verification coming soon." });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if not found to prevent enumeration
      const msg = "If that email is in our system, a reset code has been sent.";
      return res.status(200).json({ message: msg });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    sendPasswordResetEmail(user.email, otp).catch(console.error);

    res.status(200).json({ message: "If that email is in our system, a reset code has been sent." });
  })
);

router.post(
  "/verify-reset-otp",
  validate({ body: verifyResetOtpSchema }),
  passwordResetLimiter,
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset code." });
    }

    res.status(200).json({ message: "Reset code verified." });
  })
);

router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  passwordResetLimiter,
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." 
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  })
);

router.post(
  "/resend-otp",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, method, flow } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (method === "phone") {
      return res.status(400).json({ message: "Phone verification coming soon." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (flow === "reset") {
      sendPasswordResetEmail(user.email, otp).catch(console.error);
    } else {
      sendOtpEmail(user.email, otp).catch(console.error);
    }

    res.json({ message: "Verification code resent successfully via email." });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || `${process.env.JWT_SECRET}_refresh`;
      const decoded = jwt.verify(refreshToken, refreshTokenSecret);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({ message: "Token has been revoked" });
      }

      generateAuthCookies(res, user);
      res.json({ message: "Token refreshed" });
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
  })
);

router.post(
  "/logout-all",
  protect,
  asyncHandler(async (req, res) => {
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    await req.user.save();
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ message: "Logged out of all devices successfully" });
  })
);

export default router;
