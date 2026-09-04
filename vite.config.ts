import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  //const env = loadEnv(mode, process.cwd(), "");
  return {
    //define: {
    //  "process.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL),
    //},
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  };
});
