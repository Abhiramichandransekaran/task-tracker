import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("POST /api/auth/login", () => {
  it("logs in successfully with valid admin credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "Login successful",
      user: {
        username: "admin",
        role: "Administrator",
      },
    });
    expect(res.body.token).toBeDefined();
  });

  it("also accepts admin email as username", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin@tasktracker.com", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("admin");
  });

  it("returns 401 with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "wrong_user", password: "wrong_password" });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Invalid admin credentials");
  });

  it("returns 400 when missing username or password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });
});
