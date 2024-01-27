import { defineConfig } from "@solidjs/start/config";
import * as path from "path";
import fs from "fs";

// List files located at src/routes directory

function getRoutes() {
  const fs = require("fs");
  const path = require("path");

  let filesInRoutes: string[] = [];
  function getRoutes_imp(root: string) {
    let fullPath = "";
    fs.readdirSync(root).forEach((file: string) => {
      fullPath = path.join(root as string, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getRoutes_imp(fullPath);
      }
      filesInRoutes.push(fullPath);
    });
  }

  const routesFolder = path.resolve(__dirname, "src/routes");
  getRoutes_imp(routesFolder);

  let routes: string[] = [];
  // Filter out files that are not .tsx and remove src/routes, .tsx, index, and \ from path
  for (let file of filesInRoutes) {
    if (file.endsWith(".tsx")) {
      // Filter out files that are not .tsx
      let route = file
        .replace(routesFolder, "") // Remove src/routes from path
        .replace(".tsx", "") // Remove .tsx from path
        .replace(/\\/g, "/") // Replace \ with /
        .replace("/index", ""); // Remove index from path
      route = route === "" ? "/" : route; // Replace empty string with /
      routes.push(route);
    }
  }

  routes.splice(routes.indexOf("/test"), 1); // Remove /test from routes
  return routes;
}

getRoutes();

export default defineConfig({
  // start: {
  //   ssr: true,
  //
  //   server: {
  //     preset: "static",
  //
  //     routeRules: {
  //       "/test": {
  //         cors: false,
  //       },
  //     },
  //
  //     prerender: {
  //       routes: getRoutes(),
  //       crawlLinks: true,
  //     },
  //
  //     output: {
  //       dir: "dist",
  //     },
  //   },
  // },
});
