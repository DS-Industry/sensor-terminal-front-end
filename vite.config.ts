import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Разрешает доступ с внешних устройств
    allowedHosts: [
      "uniformly-different-cony.cloudpub.ru", // Разрешаем доступ с CloudPub
      "localhost", // Разрешаем локальный доступ
      "127.0.0.1", // Разрешаем доступ по IP
    ],
  },
});
