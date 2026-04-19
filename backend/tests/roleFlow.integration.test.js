const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const SECRET = "integration-test-secret";

const buildApp = () => {
  const app = express();

  app.get("/student-area", authMiddleware, allowRoles("student"), (req, res) => {
    res.status(200).json({ success: true, role: req.user.role });
  });

  return app;
};

const issueToken = (role) => jwt.sign({ userId: "u1", role }, SECRET, { expiresIn: "10m" });

test.before(() => {
  process.env.JWT_SECRET = SECRET;
});

test("returns 401 when auth token is missing", async () => {
  const app = buildApp();

  const response = await request(app).get("/student-area");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "No token provided");
});

test("returns 401 when auth token is invalid", async () => {
  const app = buildApp();

  const response = await request(app)
    .get("/student-area")
    .set("Authorization", "Bearer invalid-token");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid token");
});

test("returns 403 when role is not allowed", async () => {
  const app = buildApp();
  const mentorToken = issueToken("mentor");

  const response = await request(app)
    .get("/student-area")
    .set("Authorization", `Bearer ${mentorToken}`);

  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Access denied");
});

test("returns 200 for allowed student role", async () => {
  const app = buildApp();
  const studentToken = issueToken("student");

  const response = await request(app)
    .get("/student-area")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.role, "student");
});
