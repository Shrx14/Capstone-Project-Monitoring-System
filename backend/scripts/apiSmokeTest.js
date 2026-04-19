/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000/api/v1";

const expectSuccess = (json, step) => {
  if (!json || json.success !== true) {
    throw new Error(`${step} failed: ${JSON.stringify(json)}`);
  }
};

const request = async (method, endpoint, { token, body, isFormData = false } = {}) => {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody;
  if (body !== undefined) {
    if (isFormData) {
      requestBody = body;
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: requestBody,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`Non-JSON response for ${method} ${endpoint}: ${text}`);
  }

  return { status: res.status, json };
};

const register = async (payload) => {
  const { status, json } = await request("POST", "/auth/register", { body: payload });
  if (![200, 201].includes(status)) {
    throw new Error(`Register failed (${status}): ${JSON.stringify(json)}`);
  }
  expectSuccess(json, `Register ${payload.role}`);
  return json;
};

const login = async (email, password) => {
  const { status, json } = await request("POST", "/auth/login", {
    body: { email, password },
  });

  if (status !== 200) {
    throw new Error(`Login failed (${status}): ${JSON.stringify(json)}`);
  }
  expectSuccess(json, `Login ${email}`);
  return json;
};

const run = async () => {
  const runId = Date.now();
  const password = "pass123";

  const coordinator = {
    name: "Coord Tester",
    email: `coord.${runId}@test.com`,
    password,
    role: "coordinator",
  };
  const mentor = {
    name: "Mentor Tester",
    email: `mentor.${runId}@test.com`,
    password,
    role: "mentor",
  };
  const student = {
    name: "Student Tester",
    email: `student.${runId}@test.com`,
    password,
    role: "student",
  };

  const results = [];
  const pass = (step, detail = "") => results.push({ step, status: "PASS", detail });

  console.log("Starting API smoke test...\n");

  await register(coordinator);
  pass("1. Register coordinator");

  await register(mentor);
  pass("2. Register mentor");

  await register(student);
  pass("3. Register student");

  const coordLogin = await login(coordinator.email, password);
  const mentorLogin = await login(mentor.email, password);
  const studentLogin = await login(student.email, password);
  pass("4. Login all roles");

  const coordinatorToken = coordLogin.token;
  const mentorToken = mentorLogin.token;
  const studentToken = studentLogin.token;

  const mentorsRes = await request("GET", "/users?role=mentor", { token: studentToken });
  if (mentorsRes.status !== 200) {
    throw new Error(`GET mentors failed (${mentorsRes.status}): ${JSON.stringify(mentorsRes.json)}`);
  }
  expectSuccess(mentorsRes.json, "GET mentors");
  const mentorMatch = (mentorsRes.json.data || []).find((m) => m.email === mentor.email);
  const mentorId = mentorMatch?._id;
  if (!mentorId) {
    throw new Error("No mentor found from /users?role=mentor");
  }
  pass("5. Get mentors list", `mentorId=${mentorId}`);

  const createProjectRes = await request("POST", "/projects", {
    token: studentToken,
    body: {
      title: "API Smoke Project",
      description: "Project for endpoint verification",
      groupMembers: ["Student Tester", "Member 2"],
      mentorId,
    },
  });
  if (createProjectRes.status !== 201) {
    throw new Error(`Create project failed (${createProjectRes.status}): ${JSON.stringify(createProjectRes.json)}`);
  }
  expectSuccess(createProjectRes.json, "Create project");
  const projectId = createProjectRes.json.data?._id;
  if (!projectId) {
    throw new Error("Missing projectId from create project response");
  }
  pass("6. Create project", `projectId=${projectId}`);

  const createMilestoneRes = await request("POST", "/milestones", {
    token: studentToken,
    body: {
      projectId,
      title: "Phase 1",
      description: "Initial milestone",
      dueDate: "2026-06-01",
    },
  });
  if (createMilestoneRes.status !== 201) {
    throw new Error(`Create milestone failed (${createMilestoneRes.status}): ${JSON.stringify(createMilestoneRes.json)}`);
  }
  expectSuccess(createMilestoneRes.json, "Create milestone");
  const milestoneId = createMilestoneRes.json.data?._id;
  if (!milestoneId) {
    throw new Error("Missing milestoneId from create milestone response");
  }
  pass("7. Create milestone", `milestoneId=${milestoneId}`);

  const tmpFilePath = path.join(process.cwd(), "scripts", `temp-${runId}.png`);
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgL+X2Z8AAAAASUVORK5CYII=";
  fs.writeFileSync(tmpFilePath, Buffer.from(tinyPngBase64, "base64"));

  const formData = new FormData();
  formData.append("projectId", projectId);
  formData.append("text", "Week 1 progress update");
  const pngBlob = new Blob([fs.readFileSync(tmpFilePath)], { type: "image/png" });
  formData.append("file", pngBlob, `smoke-${runId}.png`);

  const submitUpdateRes = await request("POST", "/updates", {
    token: studentToken,
    body: formData,
    isFormData: true,
  });
  fs.unlinkSync(tmpFilePath);

  if (submitUpdateRes.status !== 201) {
    throw new Error(`Submit update failed (${submitUpdateRes.status}): ${JSON.stringify(submitUpdateRes.json)}`);
  }
  expectSuccess(submitUpdateRes.json, "Submit update");
  const updateId = submitUpdateRes.json.data?._id;
  const fileUrl = submitUpdateRes.json.data?.fileUrl;
  if (!updateId) {
    throw new Error("Missing updateId from submit update response");
  }
  pass("8. Submit update with attachment", fileUrl || "No fileUrl returned");

  const mentorAssignedRes = await request("GET", "/projects/assigned", { token: mentorToken });
  if (mentorAssignedRes.status !== 200) {
    throw new Error(`Get assigned projects failed (${mentorAssignedRes.status}): ${JSON.stringify(mentorAssignedRes.json)}`);
  }
  expectSuccess(mentorAssignedRes.json, "Mentor assigned projects");
  pass("9. Mentor assigned projects");

  const mentorUpdatesRes = await request("GET", `/updates/project/${projectId}`, { token: mentorToken });
  if (mentorUpdatesRes.status !== 200) {
    throw new Error(`Mentor project updates failed (${mentorUpdatesRes.status}): ${JSON.stringify(mentorUpdatesRes.json)}`);
  }
  expectSuccess(mentorUpdatesRes.json, "Mentor project updates");
  pass("10. Mentor get project updates");

  const reviewUpdateRes = await request("PATCH", `/updates/${updateId}/review`, {
    token: mentorToken,
    body: { status: "approved", feedback: "Good work" },
  });
  if (reviewUpdateRes.status !== 200) {
    throw new Error(`Review update failed (${reviewUpdateRes.status}): ${JSON.stringify(reviewUpdateRes.json)}`);
  }
  expectSuccess(reviewUpdateRes.json, "Review update");
  pass("11. Mentor review update");

  const coordProjectsRes = await request("GET", "/projects", { token: coordinatorToken });
  if (coordProjectsRes.status !== 200) {
    throw new Error(`Coordinator get projects failed (${coordProjectsRes.status}): ${JSON.stringify(coordProjectsRes.json)}`);
  }
  expectSuccess(coordProjectsRes.json, "Coordinator projects");
  pass("12. Coordinator get all projects");

  const coordStatusRes = await request("PATCH", `/projects/${projectId}/status`, {
    token: coordinatorToken,
    body: { status: "in_progress" },
  });
  if (coordStatusRes.status !== 200) {
    throw new Error(`Coordinator update status failed (${coordStatusRes.status}): ${JSON.stringify(coordStatusRes.json)}`);
  }
  expectSuccess(coordStatusRes.json, "Coordinator update project status");
  pass("13. Coordinator update project status");

  const coordAnnCreateRes = await request("POST", "/announcements", {
    token: coordinatorToken,
    body: { message: "Submit by Friday" },
  });
  if (coordAnnCreateRes.status !== 201) {
    throw new Error(`Create announcement failed (${coordAnnCreateRes.status}): ${JSON.stringify(coordAnnCreateRes.json)}`);
  }
  expectSuccess(coordAnnCreateRes.json, "Create announcement");
  pass("14. Coordinator create announcement");

  const anyAnnRes = await request("GET", "/announcements", { token: studentToken });
  if (anyAnnRes.status !== 200) {
    throw new Error(`Get announcements failed (${anyAnnRes.status}): ${JSON.stringify(anyAnnRes.json)}`);
  }
  expectSuccess(anyAnnRes.json, "Get announcements");
  pass("15. Any role get announcements");

  const projectStatsRes = await request("GET", "/projects/stats", { token: coordinatorToken });
  if (projectStatsRes.status !== 200) {
    throw new Error(`Project stats failed (${projectStatsRes.status}): ${JSON.stringify(projectStatsRes.json)}`);
  }
  expectSuccess(projectStatsRes.json, "Project stats");
  pass("16. Coordinator project stats", JSON.stringify(projectStatsRes.json.data));

  const milestoneCompleteRes = await request("PATCH", `/milestones/${milestoneId}`, {
    token: studentToken,
    body: { status: "completed" },
  });
  if (milestoneCompleteRes.status !== 200) {
    throw new Error(`Milestone completion failed (${milestoneCompleteRes.status}): ${JSON.stringify(milestoneCompleteRes.json)}`);
  }
  expectSuccess(milestoneCompleteRes.json, "Milestone complete");
  pass("17. Student mark milestone complete");

  console.log("\nSmoke test results:");
  results.forEach((r) => console.log(`- ${r.status}: ${r.step}${r.detail ? ` -> ${r.detail}` : ""}`));

  const summary = {
    passed: results.length,
    projectId,
    milestoneId,
    updateId,
    fileUrl,
  };

  console.log("\nSummary:");
  console.log(JSON.stringify(summary, null, 2));
};

run().catch((error) => {
  console.error("\nSmoke test failed:");
  console.error(error.message);
  process.exit(1);
});


