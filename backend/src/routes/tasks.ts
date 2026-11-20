import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { Task } from "../models/Task";
import { createTaskSchema, updateTaskSchema, listQuerySchema } from "../schemas/taskSchemas";

const router = Router();

// Strict 24-hex check (mongoose's isValidObjectId also accepts any 12-char string).
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

const validationError = (res: Response, error: ZodError) =>
  res.status(400).json({
    message: "Validation failed",
    errors: error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
  });

const notFound = (res: Response) => res.status(404).json({ message: "Task not found" });

// GET /api/tasks?status=&priority=
router.get("/", async (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);

  const tasks = await Task.find(parsed.data).sort({ createdAt: -1 });
  return res.json(tasks);
});

// POST /api/tasks
router.post("/", async (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const task = await Task.create(parsed.data);
  return res.status(201).json(task);
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  if (!OBJECT_ID.test(id)) return notFound(res);

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const task = await Task.findByIdAndUpdate(id, parsed.data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!task) return notFound(res);
  return res.json(task);
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  if (!OBJECT_ID.test(id)) return notFound(res);

  const task = await Task.findByIdAndDelete(id);
  if (!task) return notFound(res);
  return res.json({ message: "Task deleted", id });
});

export default router;
