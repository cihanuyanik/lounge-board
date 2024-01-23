import { isServer } from "solid-js/web";

export {};

declare global {
  type Unsubscribe = () => void;
  interface HTMLElement {
    registerEventListener<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (ev: HTMLElementEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): Unsubscribe;

    registerEventListener(
      type: string,
      listener: ((ev: Event) => void) | ((ev: CustomEvent) => void),
      options?: boolean | AddEventListenerOptions,
    ): Unsubscribe;
  }

  // noinspection JSUnusedGlobalSymbols
  interface Document {
    registerEventListener<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (ev: HTMLElementEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): Unsubscribe;
  }
}

if (!isServer) {
  // @ts-ignore
  HTMLElement.prototype.registerEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options: boolean | AddEventListenerOptions,
  ) {
    this.addEventListener(type, listener, options);
    return () => this.removeEventListener(type, listener, options);
  };

  Document.prototype.registerEventListener = function (
    type,
    listener,
    options,
  ) {
    // @ts-ignore
    this.addEventListener(type, listener, options);
    // @ts-ignore
    return () => this.removeEventListener(type, listener, options);
  };
}
