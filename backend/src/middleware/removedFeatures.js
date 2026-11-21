// Accounts (sign-up, sign-in, profiles, saved items), members' reviews, the restaurant-listing form
// and travel-agency listings were removed from Wazwan Way in November 2026. Their routers
// (routes/authRoutes.js, userRoutes.js, reviewRoutes.js, restaurantLeadRoutes.js,
// travelAgencyRoutes.js, uploadRoutes.js) are no longer mounted by server.js, so no one can sign up
// or sign in, and a session from before ends when its 15-minute token does: nothing renews it.
// An old page or app that still calls one of these areas is told so plainly.
//
// GET /api/auth/csrf-token is not part of accounts: the chat and every other POST need it. server.js
// registers it before this, so it keeps answering. /api/uploads (files already uploaded) is a
// different path from /api/upload (the upload itself) and is not closed.
export const REMOVED_AREAS = ["/api/auth", "/api/users", "/api/reviews", "/api/restaurant-leads", "/api/travel-agencies", "/api/upload"];

export const removedFeature = (_req, res) => res.status(410).json({ message: "This feature has been removed from Wazwan Way." });
