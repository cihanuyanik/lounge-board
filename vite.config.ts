import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  start: {
    ssr: true,

    server: {
      preset: "static",

      prerender: {
        routes: ["/", "/admin", "/404"],
        crawlLinks: true,
      },

      output: {
        dir: "dist",
      },
    },
  },
});
