import { defineConfig } from "@solidjs/start/config";
import getRoutes from "./getRoutes";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  ssr: true,
  server: {
    preset: "static",
    prerender: {
      routes: getRoutes(),
      crawlLinks: true,
    },
    output: {
      dir: "dist",
    },
  },
});
