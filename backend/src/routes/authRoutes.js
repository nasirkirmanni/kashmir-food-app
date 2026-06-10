import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { createToken } from "../utils/createToken.js";
import { protect } from "../middleware/auth.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";

const router = express.Router();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post(
  "/signup",
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
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }
    
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
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
      }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      // Re-send Email OTP if they try to log in but aren't verified yet
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
      await user.save();
      
      sendOtpEmail(user.email, otp).catch(console.error);

      return res.status(200).json({ 
        message: "Please verify your email before logging in.", 
        requiresOtp: true,
        email: user.email
      });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
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

router.post(
  "/forgot-password",
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
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  })
);

router.post(
  "/resend-otp",
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

export default router;
