import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // process.cwd() is the project root where Vite runs (avoids __dirname,
      // which isn't defined in an ESM config file).
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
});
