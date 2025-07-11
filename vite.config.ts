import { defineConfig } from "vite";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import react from "@vitejs/plugin-react";
import i18nAutogen from "./src/plugins/i18NameSpacesAutoImport";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ["vitest", "react", "react-i18next"],
      dts: "./auto-imports.d.ts",
      dirs: ["./src/utils"],
      eslintrc: {
        enabled: true
      }
    }),
    i18nAutogen({
      localesDir: "src/locales", // 根据你的项目结构调整
      watchPattern: "**/*.json"
    })
  ],
  server: {
    host: true,
    open: true,
    port: 80
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src") // 将 @ 映射到 src 目录
    }
  }
});
