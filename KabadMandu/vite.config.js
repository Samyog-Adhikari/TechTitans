import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "canvg": path.resolve(__dirname, "./src/lib/void.js"),
      "dompurify": path.resolve(__dirname, "./src/lib/void.js"),
    },
  },
})
