import { defineGlobalStyles } from "@pandacss/dev";

export const bodyCss = defineGlobalStyles({
  body: {
    fontFamily: "Roboto",
    mozOsxFontSmoothing: "grayscale",
    lineHeight: 1.5,
    webkitFontSmoothing: "antialiased",
  },
});

export const fontFaces = defineGlobalStyles({
  "@font-face": {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: 400,
    src: "url(./assets/fonts/Roboto-Regular.ttf)",
  },
});
