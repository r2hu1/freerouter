import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const webSrc = resolve(dirname(fileURLToPath(import.meta.url)), "web", "src")

export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": webSrc,
    },
  },
  build: {
    outDir: "../dist/web",
    emptyOutDir: true,
    sourcemap: false,
  },
})
