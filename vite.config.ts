import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig({
  base: "/yohoussam-portfolio-chronicle/",
  plugins: [react(), componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "docs", // Vite builds here
    emptyOutDir: true, // clear folder before building
  },
});
