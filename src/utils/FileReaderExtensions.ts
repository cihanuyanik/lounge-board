import { isServer } from "solid-js/web";

export {};

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface FileReader {
    readAsyncAsDataURL(file: Blob): Promise<string | ArrayBuffer | null>;
  }
}

if (!isServer) {
  FileReader.prototype.readAsyncAsDataURL = function (file: Blob) {
    return new Promise((resolve, reject) => {
      this.onloadend = () => resolve(this.result);
      this.onerror = () => reject(this.error);
      this.readAsDataURL(file);
    });
  };
}
