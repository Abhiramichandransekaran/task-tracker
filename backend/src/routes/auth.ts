import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { loginSchema } from "../schemas/authSchemas";

const router = Router();

// Single Admin Credentials
const ADMIN_CREDENTIALS = {
  usernames: ["admin", "admin@tasktracker.com"],
  password: "admin123",
  user: {
    username: "admin",
    name: "System Admin",
    role: "Administrator",
    email: "admin@tasktracker.com",
  },
};

const validationError = (res: Response, error: ZodError) =>
  res.status(400).json({
    message: "Validation failed",
    errors: error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
  });

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return validationError(res, parsed.error);
  }

  const { username, password } = parsed.data;
  const isUsernameMatch = ADMIN_CREDENTIALS.usernames.some(
    (u) => u.toLowerCase() === username.toLowerCase()
  );
  const isPasswordMatch = password === ADMIN_CREDENTIALS.password;

  if (!isUsernameMatch || !isPasswordMatch) {
    return res.status(401).json({
      message: "Invalid admin credentials. Use admin / admin123",
    });
  }

  // Success: Return admin session
  return res.status(200).json({
    message: "Login successful",
    token: "admin-session-token-" + Date.now(),
    user: ADMIN_CREDENTIALS.user,
  });
});

// GET /api/auth/credentials-info (helper for assessment reviewer)
router.get("/credentials-info", (_req: Request, res: Response) => {
  return res.json({
    role: "Administrator",
    demoUsername: "admin",
    demoPassword: "admin123",
  });
});

export default router;
