import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors tsconfig's baseUrl so `components/Button` style imports keep working.
    alias: [{ find: /^(assets|components|constants|hooks|pages|routes|schemas|services|types)\//, replacement: `${src}/$1/` }],
  },
  server: { port: 3000 },
  preview: { port: 3000 },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: false,
  },
});
