import styles from "./index.module.scss";
import "~/utils/DialogExtensions";

import {
  createContext,
  JSX,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { Portal } from "solid-js/web";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import { createStore } from "solid-js/store";
import { createMutator, waitUntil } from "~/utils/utils";

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

  async function registerEventListeners() {
    await waitUntil(
      () => dialogRef !== undefined && dialogRef !== null,
      50,
      1000,
    );

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
        // class={`dialog${local.class ? " " + local.class : ""}`}
        class={styles.Dialog}
        classList={{
          [local.class!]: local.class !== undefined,
        }}
        {...rest}
      >
        {local.children}
      </dialog>
    </Portal>
  );
}

type DialogControlsProps = {
  disabled?: boolean;
  onAccept: () => void;
  onCancel: () => void;
};

export function DialogControls(props: DialogControlsProps) {
  return (
    <>
      <Button
        class={`${styles.controlButton} ${styles.accept}`}
        onClick={props.onAccept}
        disabled={props.disabled}
      >
        <Tick />
      </Button>

      <Button
        class={`${styles.controlButton} ${styles.cancel}`}
        onClick={props.onCancel}
      >
        <Cross />
      </Button>
    </>
  );
}

///////////////////////////////////////////////////////////
// Dialog Context Generator
///////////////////////////////////////////////////////////
export function createDialogContext<T extends object>(storeInitializer: T) {
  // Create store, and mutator
  function createDialogStore() {
    const [state, setState] = createStore(storeInitializer);
    const mutate = createMutator(setState);
    return { state, mutate };
  }

  // Create context
  type ContextType = {} & ReturnType<typeof createDialogStore>;
  const Context = createContext<ContextType>();

  // Create context provider
  function ContextProvider(props: any) {
    const { state, mutate } = createDialogStore();
    return (
      <Context.Provider value={{ state, mutate }}>
        {props.children}
      </Context.Provider>
    );
  }

  function useDialogContext() {
    return (useContext(Context) as ContextType) || {};
  }

  return { ContextProvider, useDialogContext };
}
