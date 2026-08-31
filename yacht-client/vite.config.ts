import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { MinifyOptions } from "terser";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "react",
      babel: {
        parserOpts: {
          plugins: ["typescript", "jsx"]
        }
      }
    })
  ],
  esbuild: {
    loader: "tsx",
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  },
  build: {
    target: "esnext", // современный JS, меньше полифиллов
    minify: "terser",  // более агрессивная минификация
    terserOptions: {
      compress: {
      drop_console: false,  // удаляем console.log
        drop_debugger: true, // удаляем debugger
      } as MinifyOptions["compress"],
      format: {
        comments: false,     // убираем комментарии
      }
    },
    cssCodeSplit: true,      // разделение CSS на чанки
    sourcemap: false,        // отключаем карты исходников
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true
  }
});