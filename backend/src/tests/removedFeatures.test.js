// Accounts, members' reviews, the restaurant-listing form and travel-agency listings are closed on
// the API: nothing under those addresses answers any more, and what the rest of the site needs
// from beside them still does.
// Run: node --test src/tests/removedFeatures.test.js
import { after, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import { REMOVED_AREAS, removedFeature } from "../middleware/removedFeatures.js";

const servers = [];
after(() => Promise.all(servers.map((server) => new Promise((resolve) => (server.closeAllConnections?.(), server.close(resolve))))));

test("every address of a removed feature answers 410, and its neighbours are left alone", async () => {
  // Mounted in the order server.js mounts them.
  const app = express();
  app.get("/api/auth/csrf-token", (_req, res) => res.json({ csrfToken: "t" }));
  app.use("/api/uploads", (_req, res) => res.json({ file: true }));
  app.use(REMOVED_AREAS, removedFeature);
  app.use("/api/dishes", (_req, res) => res.json({ dishes: [] }));
  app.use((_req, res) => res.status(404).json({ message: "not found" }));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  const base = `http://127.0.0.1:${server.address().port}`;
  const status = async (method, path) => (await fetch(`${base}${path}`, { method, headers: { "Content-Type": "application/json" }, ...(method === "GET" ? {} : { body: "{}" }) })).status;

  const closed = [
    ["POST", "/api/auth/signup"],
    ["POST", "/api/auth/login"],
    ["POST", "/api/auth/verify"],
    ["POST", "/api/auth/refresh"],
    ["POST", "/api/auth/forgot-password"],
    ["GET", "/api/auth/me"],
    ["GET", "/api/users/favorites"],
    ["PUT", "/api/users/profile"],
    ["POST", "/api/reviews"],
    ["GET", "/api/reviews/restaurant/6a5247d82519b282b59976f3"],
    ["POST", "/api/restaurant-leads"],
    ["GET", "/api/travel-agencies"],
    ["POST", "/api/travel-agencies/register"],
    ["POST", "/api/travel-agencies/6a5247d82519b282b59976f3/book"],
    ["POST", "/api/upload"],
  ];
  for (const [method, path] of closed) assert.equal(await status(method, path), 410, `${method} ${path}`);
  const gone = await (await fetch(`${base}/api/auth/login`, { method: "POST" })).json();
  assert.deepEqual(gone, { message: "This feature has been removed from Wazwan Way." });

  // What the site still needs.
  assert.equal(await status("GET", "/api/auth/csrf-token"), 200, "the token every POST needs, the chat included");
  assert.equal(await status("GET", "/api/uploads/photo.jpg"), 200, "files already uploaded are a different address from the upload itself");
  assert.equal(await status("GET", "/api/dishes"), 200);
});

test("the server mounts none of the removed routers, and closes their addresses after the token route", () => {
  const source = readFileSync(fileURLToPath(new URL("../server.js", import.meta.url)), "utf8");
  for (const router of ["authRoutes", "userRoutes", "reviewRoutes", "restaurantLeadRoutes", "travelAgencyRoutes", "uploadRoutes"]) {
    assert.equal(source.includes(router), false, `${router} is still named in server.js`);
  }
  const tokenRoute = source.indexOf('app.get("/api/auth/csrf-token"');
  const closing = source.indexOf("app.use(REMOVED_AREAS, removedFeature)");
  const firstRouter = source.indexOf('app.use("/api/dishes"');
  assert.ok(tokenRoute !== -1 && closing !== -1 && firstRouter !== -1);
  assert.ok(tokenRoute < closing, "the token route must be registered first, or it would be closed too");
  assert.ok(closing < firstRouter);
});
