import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/tasks", tasksRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler: malformed JSON -> 400, everything else -> 500 (always JSON).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
