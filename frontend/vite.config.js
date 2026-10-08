import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite's config file. The react() plugin enables JSX support and Fast Refresh
// (instant UI updates in the browser when you save a file, without losing
// component state - a huge productivity boost over old-school full reloads).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy: any request from React to "/api/..." during development gets
    // forwarded to our backend at localhost:5000. This lets us write
    // axios.get("/api/products") in the frontend without hardcoding the
    // full backend URL everywhere, and avoids CORS issues in dev.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
