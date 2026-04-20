import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("recharts") || id.includes("d3")) {
            return "charts-vendor";
          }

          return "vendor";
        },
      },
    },
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: 88,
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: [''],
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/erp-api': {
        target: 'https://erpb.gfsa.gov.sa/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/erp-api/, ''),
      }
    }
  }
});
