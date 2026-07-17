// Regression test for the validation middleware (zod v4 compatibility).
// Bug: zod v4 renamed ZodError.errors -> ZodError.issues, so `error.errors.map`
// threw inside the catch block, turning every 400 validation error into a 500.
// Run: node --test src/tests/validate.test.js

import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test("invalid body -> 400 with details, does NOT fall through to error handler (500)", () => {
  const schema = z.object({ email: z.string().email(), age: z.number().min(1) }).strict();
  const req = { body: { email: "bad", age: 0 } };
  const res = mockRes();
  let nextArg = "NOT_CALLED";

  const mw = validate({ body: schema });
  // Before the fix, this throws (error.errors is undefined in zod v4).
  assert.doesNotThrow(() => mw(req, res, (e) => { nextArg = e; }));

  assert.equal(res.statusCode, 400, "should respond 400, not crash to 500");
  assert.equal(res.body.success, false);
  assert.ok(Array.isArray(res.body.details) && res.body.details.length > 0, "should include field details");
  assert.ok(typeof res.body.message === "string" && res.body.message.length > 0, "should include a human message the client can surface");
  assert.equal(nextArg, "NOT_CALLED", "must not pass the error to next() / error middleware");
});

test("valid body passes through and reassigns parsed values", () => {
  const schema = z.object({ email: z.string().email() }).strict();
  const req = { body: { email: "A@B.com" } };
  const res = mockRes();
  let called = false;

  validate({ body: schema })(req, res, () => { called = true; });

  assert.ok(called, "next() should be called for valid input");
  assert.equal(res.statusCode, null, "no error response for valid input");
});
