import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  base: "/nbs-legal-chatbot/",
  resolve: {
    dedupe: ['react', 'react-dom', 'react-pdf'],
  },
  optimizeDeps: {
    force: true,
  },
  build: {
    outDir: "./dist-frontend",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      // Proxy /uploads/* to your backend (adjust if your URLs differ)
      '/uploads': {
        target: 'http://nbsdevtest:83',
        changeOrigin: true,
        secure: false, // For http targets
        rewrite: (path) => path // Keep /uploads intact
      }
    }
  },
});
