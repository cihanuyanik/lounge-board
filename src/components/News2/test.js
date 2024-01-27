// // npm i puppeteer
//
// // async function getContentHeight({ clientWidth, clientHeight }) {
// //   const browser = await puppeteer.launch({ headless: true });
// //   const page = await browser.newPage();
// //   await page.setViewport({ width: clientWidth, height: clientHeight });
// //   await page.goto(
// //     "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7153016155866116098",
// //   );
// //   const contentHeight = await page.evaluate(() => {
// //     let body = document.body,
// //       html = document.documentElement;
// //
// //     let height = Math.max(
// //       body.scrollHeight,
// //       body.offsetHeight,
// //       html.clientHeight,
// //       html.scrollHeight,
// //       html.offsetHeight,
// //     );
// //     return height;
// //   });
// //   console.log(contentHeight);
// //
// //   await browser.close();
// // }
//
// // getContentHeight({ clientWidth: 1056, clientHeight: 150 });
//
// // import { lazy } from "solid-js";
// //
// // export const puppeteer = lazy(async () => {
// //   return await import("puppeteer");
// // });
//
// export async function estimateIFrameHeight(width, url) {
//   console.log("estimateIFrameHeight");
//
//   // const lazy = (await import("solid-js")).lazy;
//   //
//   // const puppeteer = lazy(async () => {
//   //   const p = (await import("puppeteer")).default;
//   //   return p;
//   // });
//
//   // MOVE FUNCTIONAITY INTO A NODE SERVER
//
//   const puppeteerLoader = new Promise((resolve, reject) => {
//     const puppeteer = require("puppeteer");
//     resolve(puppeteer);
//     // import("puppeteer")
//     //   .then((puppeteer) => {
//     //     resolve(puppeteer.default);
//     //   })
//     //   .catch((e) => {
//     //     console.log(e);
//     //     reject(e);
//     //   });
//   });
//   console.log("estimateIFrameHeight 2");
//
//   const puppeteer = await puppeteerLoader;
//   console.log(puppeteer);
//
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.setViewport({ width: width, height: 150 });
//   await page.goto(url);
//
//   const contentHeight = await page.evaluate(() => {
//     let body = document.body,
//       html = document.documentElement;
//
//     return Math.max(
//       body.scrollHeight,
//       body.offsetHeight,
//       html.clientHeight,
//       html.scrollHeight,
//       html.offsetHeight,
//     );
//   });
//   console.log(contentHeight);
//
//   await browser.close();
//
//   return contentHeight;
// }
