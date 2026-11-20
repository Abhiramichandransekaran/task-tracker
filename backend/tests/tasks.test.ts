import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import { Task } from "../src/models/Task";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const MISSING_ID = "64b7f0c2a1b2c3d4e5f60718";

describe("POST /api/tasks", () => {
  it("creates a task and returns 201 with saved fields and defaults", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Fix login bug", description: "Users get logged out" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Fix login bug",
      description: "Users get logged out",
      status: "todo",
      priority: "medium",
    });
    expect(res.body._id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();

    const saved = await Task.findById(res.body._id);
    expect(saved?.title).toBe("Fix login bug");
  });

  it("returns 400 with a descriptive error when title is too short", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "ab" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual({
      field: "title",
      message: "Title must be at least 3 characters",
    });
    expect(await Task.countDocuments()).toBe(0);
  });

  it("returns 400 when title is missing or enums are invalid", async () => {
    const res = await request(app).post("/api/tasks").send({ priority: "urgent" });

    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["title", "priority"]));
  });

  it("returns 400 JSON on a malformed JSON body", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Malformed JSON body");
  });
});

describe("GET /api/tasks", () => {
  it("filters by status and priority", async () => {
    await Task.create([
      { title: "Task A", status: "done", priority: "high" },
      { title: "Task B", status: "todo", priority: "high" },
      { title: "Task C", status: "done", priority: "low" },
    ]);

    const res = await request(app).get("/api/tasks?status=done&priority=high");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Task A");
  });

  it("rejects an invalid filter value with 400", async () => {
    const res = await request(app).get("/api/tasks?status=archived");
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("updates a task's status", async () => {
    const task = await Task.create({ title: "Write tests" });

    const res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("in_progress");
    expect((await Task.findById(task._id))?.status).toBe("in_progress");
  });

  it("returns 400 for an invalid status value", async () => {
    const task = await Task.create({ title: "Write tests" });

    const res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "finished" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing task and for an invalid id format", async () => {
    const missing = await request(app).patch(`/api/tasks/${MISSING_ID}`).send({ status: "done" });
    const invalid = await request(app).patch("/api/tasks/not-an-id").send({ status: "done" });

    expect(missing.status).toBe(404);
    expect(invalid.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes a task and confirms", async () => {
    const task = await Task.create({ title: "Old bug" });

    const res = await request(app).delete(`/api/tasks/${task._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Task deleted", id: String(task._id) });
    expect(await Task.findById(task._id)).toBeNull();
  });

  it("returns 404 when the task does not exist", async () => {
    const res = await request(app).delete(`/api/tasks/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});
