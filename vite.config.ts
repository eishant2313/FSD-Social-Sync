import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Automatically fallback to /FSD-Social-Sync/ for GitHub Pages subpath deployment
const BASE_PATH = process.env.VITE_BASE_PATH ?? "/FSD-Social-Sync/";

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      router: { basepath: BASE_PATH },
      spa: { enabled: true },
    }),
    viteReact(),
    nitro(),
  ],
});
