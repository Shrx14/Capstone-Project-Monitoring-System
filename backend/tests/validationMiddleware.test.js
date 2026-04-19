const test = require("node:test");
const assert = require("node:assert/strict");

const { body } = require("express-validator");
const validateRequest = require("../middleware/validationMiddleware");

const runSingleValidation = async (req, validator) => {
  await validator.run(req);
};

test("validationMiddleware calls next for valid request", async () => {
  const req = {
    body: {
      name: "Student One",
    },
  };

  const res = {
    statusCalled: false,
    status() {
      this.statusCalled = true;
      return this;
    },
    json() {
      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await runSingleValidation(req, body("name").isString().notEmpty());
  validateRequest(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(res.statusCalled, false);
});

test("validationMiddleware returns consistent 400 payload for invalid request", async () => {
  const req = {
    body: {
      name: "",
    },
  };

  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };

  const next = () => {
    throw new Error("next should not be called for invalid payload");
  };

  await runSingleValidation(req, body("name").notEmpty().withMessage("name is required"));
  validateRequest(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Validation failed");
  assert.ok(Array.isArray(res.payload.errors));
  assert.ok(res.payload.errors.some((error) => error.field === "name"));
});
