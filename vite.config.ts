import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  /* resolve: {
    alias: {
      "@client": path.resolve(__dirname, "src/client"),
      "@server": path.resolve(__dirname, "src/server"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  }, */
  server: {
    proxy: {
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
      }
    }
  }
});
