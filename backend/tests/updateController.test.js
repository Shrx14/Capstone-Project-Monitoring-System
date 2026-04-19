const test = require("node:test");
const assert = require("node:assert/strict");

const Project = require("../models/Project");
const Update = require("../models/Update");
const cloudinary = require("../utils/cloudinary");
const { getUpdatesByProject, replaceAttachment } = require("../controllers/updateController");

const makeRes = () => {
  return {
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
};

test("getUpdatesByProject adds signed fileAccessUrl when signing succeeds", async () => {
  const originalProjectFindById = Project.findById;
  const originalUpdateFind = Update.find;
  const originalPrivateDownloadUrl = cloudinary.utils.private_download_url;

  Project.findById = async () => ({
    _id: "507f191e810c19729de860ea",
    createdBy: "student-id",
    mentorId: "mentor-id",
  });

  Update.find = () => ({
    populate() {
      return this;
    },
    sort() {
      return Promise.resolve([
        {
          toObject() {
            return {
              _id: "507f191e810c19729de860eb",
              filePublicId: "capstone-updates/sample-report.pdf",
              fileUrl: "https://fallback.example/file.pdf",
            };
          },
        },
      ]);
    },
  });

  cloudinary.utils.private_download_url = () => "https://signed.example/download";

  const req = {
    params: { projectId: "507f191e810c19729de860ea" },
    user: { role: "student", userId: "student-id" },
  };
  const res = makeRes();

  await getUpdatesByProject(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.length, 1);
  assert.equal(res.payload.data[0].fileAccessUrl, "https://signed.example/download");

  Project.findById = originalProjectFindById;
  Update.find = originalUpdateFind;
  cloudinary.utils.private_download_url = originalPrivateDownloadUrl;
});

test("getUpdatesByProject falls back to fileUrl when signing fails", async () => {
  const originalProjectFindById = Project.findById;
  const originalUpdateFind = Update.find;
  const originalPrivateDownloadUrl = cloudinary.utils.private_download_url;

  Project.findById = async () => ({
    _id: "507f191e810c19729de860ea",
    createdBy: "student-id",
    mentorId: "mentor-id",
  });

  Update.find = () => ({
    populate() {
      return this;
    },
    sort() {
      return Promise.resolve([
        {
          toObject() {
            return {
              _id: "507f191e810c19729de860eb",
              filePublicId: "capstone-updates/sample-report.pdf",
              fileUrl: "https://fallback.example/file.pdf",
            };
          },
        },
      ]);
    },
  });

  cloudinary.utils.private_download_url = () => {
    throw new Error("signing failed");
  };

  const req = {
    params: { projectId: "507f191e810c19729de860ea" },
    user: { role: "student", userId: "student-id" },
  };
  const res = makeRes();

  await getUpdatesByProject(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.length, 1);
  assert.equal(res.payload.data[0].fileAccessUrl, "https://fallback.example/file.pdf");

  Project.findById = originalProjectFindById;
  Update.find = originalUpdateFind;
  cloudinary.utils.private_download_url = originalPrivateDownloadUrl;
});

test("replaceAttachment updates file and removes previous Cloudinary asset", async () => {
  const originalUpdateFindById = Update.findById;
  const originalUploadStream = cloudinary.uploader.upload_stream;
  const originalDestroy = cloudinary.uploader.destroy;

  const updateRecord = {
    _id: "507f191e810c19729de860eb",
    submittedBy: "student-id",
    status: "pending",
    filePublicId: "capstone-updates/old-report.pdf",
    fileUrl: "https://old.example/file.pdf",
    async save() {
      return this;
    },
    toObject() {
      return {
        _id: this._id,
        filePublicId: this.filePublicId,
        fileUrl: this.fileUrl,
      };
    },
  };

  Update.findById = async () => updateRecord;

  cloudinary.uploader.upload_stream = (options, callback) => {
    return {
      end() {
        callback(null, {
          secure_url: "https://new.example/file.pdf",
          public_id: "capstone-updates/new-report.pdf",
        });
      },
    };
  };

  let destroyedPublicId = null;
  cloudinary.uploader.destroy = async (publicId) => {
    destroyedPublicId = publicId;
  };

  const req = {
    params: { id: "507f191e810c19729de860eb" },
    user: { userId: "student-id", role: "student" },
    file: {
      buffer: Buffer.from("new-file"),
      originalname: "new-report.pdf",
      mimetype: "application/pdf",
    },
  };
  const res = makeRes();

  await replaceAttachment(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.filePublicId, "capstone-updates/new-report.pdf");
  assert.equal(destroyedPublicId, "capstone-updates/old-report.pdf");

  Update.findById = originalUpdateFindById;
  cloudinary.uploader.upload_stream = originalUploadStream;
  cloudinary.uploader.destroy = originalDestroy;
});

test("replaceAttachment blocks non-owner students", async () => {
  const originalUpdateFindById = Update.findById;

  Update.findById = async () => ({
    _id: "507f191e810c19729de860eb",
    submittedBy: "another-student",
    status: "pending",
  });

  const req = {
    params: { id: "507f191e810c19729de860eb" },
    user: { userId: "student-id", role: "student" },
    file: {
      buffer: Buffer.from("new-file"),
      originalname: "new-report.pdf",
      mimetype: "application/pdf",
    },
  };
  const res = makeRes();

  await replaceAttachment(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.success, false);

  Update.findById = originalUpdateFindById;
});
