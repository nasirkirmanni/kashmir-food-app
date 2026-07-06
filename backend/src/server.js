import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dishRoutes from "./routes/dishRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import restaurantLeadRoutes from "./routes/restaurantLeadRoutes.js";
import travelAgencyRoutes from "./routes/travelAgencyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "https://kashmir-food-app.vercel.app",
  "https://wazwanway.com",
  "https://www.wazwanway.com",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [])
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "wazwan-way-secret-csrf-key",
  getSessionIdentifier: (req) => "stateless-session",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"]
});

app.get("/api/auth/csrf-token", (req, res) => {
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

app.use("/api", doubleCsrfProtection);

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/restaurant-leads", restaurantLeadRoutes);
app.use("/api/travel-agencies", travelAgencyRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.error("CSRF Debug - Server validation failed:", {
      nodeEnv: process.env.NODE_ENV,
      cookiePresent: !!req.cookies["x-csrf-token"],
      headerPresent: !!req.headers["x-csrf-token"],
      origin: req.headers.origin
    });
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }
  
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });

// Restart trigger to clear env

