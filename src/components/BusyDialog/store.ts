import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";

export type Store = {
  dialogRef: HTMLDialogElement | null;
  message: string;
  isOpen: boolean;
  show: (message: string) => void;
  close: () => void;
};

export function createBusyDialogStore() {
  const [busyDialog, setBusyDialog] = createStore<Store>({
    dialogRef: null,
    message: "",
    isOpen: false,
    show: (message: string) => {
      mutateBusyDialog((state) => {
        state.message = message;
        state.dialogRef?.ShowModal().then();
      });
    },

    close: () => {
      mutateBusyDialog((state) => {
        state.message = "";
        state.dialogRef?.Close();
      });
    },
  });

  const mutateBusyDialog = createMutator(setBusyDialog);

  return { busyDialog, mutateBusyDialog };
}
