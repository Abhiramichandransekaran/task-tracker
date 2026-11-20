import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Same-origin /api calls in dev; forwarded to the Express backend.
      proxy: {
        "/api": env.API_PROXY_TARGET || "http://localhost:5000",
      },
    },
  };
});
