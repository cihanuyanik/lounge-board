import fs from "fs";
import path from "path";

export default function () {
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

  const routesFolder = path.resolve("./", "src/routes");
  getRoutes_imp(routesFolder);

  let routes: string[] = [];
  // Filter out files that are not .tsx and remove src/routes, .tsx, index, and \ from path
  for (let file of filesInRoutes) {
    // Filter out files that are not .tsx
    if (file.endsWith(".tsx")) {
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
