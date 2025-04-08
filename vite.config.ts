import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.VITE_PUSHER_KEY': JSON.stringify(process.env.VITE_PUSHER_KEY),
    'process.env.VITE_PUSHER_CLUSTER': JSON.stringify(process.env.VITE_PUSHER_CLUSTER),
  }
}));
