import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import translateTextPlugin from "./translate-text-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [translateTextPlugin(env), react()],
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    define: {
      _AUTHOR_: JSON.stringify("smak"),
    },
  };
});
