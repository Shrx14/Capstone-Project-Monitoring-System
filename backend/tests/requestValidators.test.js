const test = require("node:test");
const assert = require("node:assert/strict");
const { validationResult } = require("express-validator");

const {
  registerValidator,
  createUpdateValidator,
  replaceAttachmentValidator,
  createMilestoneValidator,
  getUsersValidator,
} = require("../middleware/requestValidators");

const runValidations = async (req, validators) => {
  for (const validator of validators) {
    await validator.run(req);
  }

  return validationResult(req).array();
};

test("registerValidator accepts valid payload", async () => {
  const req = {
    body: {
      name: "Student One",
      email: "student@example.com",
      password: "password123",
      role: "mentor",
    },
    params: {},
    query: {},
  };

  const errors = await runValidations(req, registerValidator);
  assert.equal(errors.length, 0);
});

test("registerValidator rejects invalid role", async () => {
  const req = {
    body: {
      name: "Student One",
      email: "student@example.com",
      password: "password123",
      role: "admin",
    },
    params: {},
    query: {},
  };

  const errors = await runValidations(req, registerValidator);
  assert.ok(errors.some((error) => error.path === "role"));
});

test("createUpdateValidator requires text or content", async () => {
  const req = {
    body: {
      projectId: "507f191e810c19729de860ea",
    },
    params: {},
    query: {},
  };

  const errors = await runValidations(req, createUpdateValidator);
  assert.ok(errors.some((error) => error.path === "text"));
});

test("replaceAttachmentValidator rejects invalid update id", async () => {
  const req = {
    body: {},
    params: {
      id: "invalid-id",
    },
    query: {},
  };

  const errors = await runValidations(req, replaceAttachmentValidator);
  assert.ok(errors.some((error) => error.path === "id"));
});

test("createMilestoneValidator rejects past dueDate", async () => {
  const req = {
    body: {
      projectId: "507f191e810c19729de860ea",
      title: "Milestone 1",
      dueDate: "2000-01-01",
    },
    params: {},
    query: {},
  };

  const errors = await runValidations(req, createMilestoneValidator);
  assert.ok(errors.some((error) => error.path === "dueDate"));
});

test("getUsersValidator rejects unsupported role filter", async () => {
  const req = {
    body: {},
    params: {},
    query: {
      role: "admin",
    },
  };

  const errors = await runValidations(req, getUsersValidator);
  assert.ok(errors.some((error) => error.path === "role"));
});
