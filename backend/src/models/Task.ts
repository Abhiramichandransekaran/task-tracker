import { Schema, model, InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3, maxlength: 100, trim: true },
    description: { type: String, maxlength: 500 },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type TaskDoc = InferSchemaType<typeof taskSchema>;
export const Task = model("Task", taskSchema);