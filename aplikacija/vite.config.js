import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Default build directory, ensure it matches your `firebase.json`
    sourcemap: true, // Optional: Generates sourcemaps for debugging
  },
});
