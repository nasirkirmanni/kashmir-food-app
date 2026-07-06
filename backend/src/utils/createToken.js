import jwt from "jsonwebtoken";

export const generateAuthCookies = (res, user) => {
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || `${process.env.JWT_SECRET}_refresh`;
  const refreshToken = jwt.sign(
    { userId: user._id, tokenVersion: user.tokenVersion },
    refreshTokenSecret,
    { expiresIn: "7d" }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};
