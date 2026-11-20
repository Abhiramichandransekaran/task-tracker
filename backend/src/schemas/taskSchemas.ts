import { z } from "zod";

const statusEnum = z.enum(["todo", "in_progress", "done"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters").optional(),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined,
    {
      message: "Provide at least one of: title, description, status, priority",
    }
  );

export const listQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;