import "./index.scss";
import { JSX, onCleanup, onMount, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

type DialogProps = {
  open?: boolean;
  onBeforeShow?: (ev: CustomEvent) => void;
  onAfterShow?: (ev: CustomEvent) => void;
  onClose?: (ev: CustomEvent) => void;
} & JSX.HTMLAttributes<HTMLDialogElement>;

export type DialogRef = HTMLDialogElement | ((el: HTMLDialogElement) => void);

export default function Dialog(props: DialogProps) {
  const [local, rest] = splitProps(props, [
    "open",
    "onBeforeShow",
    "onAfterShow",
    "onClose",
    "class",
    "children",
    "ref",
  ]);

  let dialogRef: HTMLDialogElement;
  let eventListeners: Unsubscribe[] = [];

  function registerEventListeners() {
    if (!dialogRef) {
      setTimeout(registerEventListeners, 200);
      return;
    }

    if (local.onBeforeShow) {
      eventListeners.push(
        dialogRef.registerEventListener("before-show", local.onBeforeShow),
      );
    }
    if (local.onAfterShow) {
      eventListeners.push(
        dialogRef.registerEventListener("after-show", local.onAfterShow),
      );
    }
    if (local.onClose) {
      eventListeners.push(
        dialogRef.registerEventListener("close-modal", local.onClose),
      );
    }
  }

  function unregisterEventListeners() {
    eventListeners.forEach((unsub) => unsub());
    eventListeners = [];
  }

  onMount(registerEventListeners);
  onCleanup(unregisterEventListeners);

  return (
    <Portal>
      <dialog
        open={local.open}
        ref={(el) => {
          dialogRef = el;
          if (typeof local.ref === "function") local.ref(el);
          else {
            local.ref = el;
          }
        }}
        class={`dialog${local.class ? " " + local.class : ""}`}
        {...rest}
      >
        {local.children}
      </dialog>
    </Portal>
  );
}