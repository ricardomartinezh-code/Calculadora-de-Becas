import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  resolve: {
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
  },
});
