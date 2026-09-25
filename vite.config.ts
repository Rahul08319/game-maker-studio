import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
const gamePlatform = process.env.VITE_GAME_PLATFORM ?? "youtube";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    headers: {
      "Content-Security-Policy": "default-src 'none'; script-src 'report-sample' 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v0 https://www.youtube.com/game_api/v0/ https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' blob: data:; sandbox allow-pointer-lock allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; worker-src 'self' blob:",
    },
  },
  plugins: [
    react(),
    {
      name: "platform-sdk-entry",
      transformIndexHtml: (html) => html
        .replace("<!-- platform-sdk -->", gamePlatform === "youtube" ? "<script src=\"https://www.youtube.com/game_api/v1\"></script>" : "")
        .replace("<!-- platform-manifest -->", gamePlatform === "microsoft-store" ? "<link rel=\"manifest\" href=\"/manifest.webmanifest\">" : ""),
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
