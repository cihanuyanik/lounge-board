import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";

export type DialogType = "error" | "warning" | "info" | "success" | "question";

export enum DialogResult {
  OK = "OK",
  Yes = "Yes",
  No = "No",
}

export type Store = {
  dialogRef: HTMLDialogElement | null;
  type: DialogType;
  title: string;
  message: string;
  dialogResult: DialogResult;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  question: (message: string, title?: string) => Promise<DialogResult>;
  close: (result?: DialogResult) => void;
};

export function createMessageBoxStore() {
  const [messageBox, setMessageBox] = createStore<Store>({
    dialogRef: null,
    type: "error",
    title: "",
    message: "",
    dialogResult: DialogResult.OK,

    error: (message: string, title: string = "") => {
      mutateMessageBox((state) => {
        state.type = "error";
        state.message = message;
        state.title = title === "" ? "Error" : title;
        state.dialogRef?.ShowModal().then();
      });
    },

    warning: (message: string, title: string = "") => {
      mutateMessageBox((state) => {
        state.type = "warning";
        state.message = message;
        state.title = title === "" ? "Warning" : title;
        state.dialogRef?.ShowModal().then();
      });
    },

    info: (message: string, title: string = "") => {
      mutateMessageBox((state) => {
        state.type = "info";
        state.message = message;
        state.title = title === "" ? "Information" : title;
        state.dialogRef?.ShowModal().then();
      });
    },

    success: (message: string, title: string = "") => {
      mutateMessageBox((state) => {
        state.type = "success";
        state.message = message;
        state.title = title === "" ? "Successful" : title;
        state.dialogRef?.ShowModal().then();
      });
    },

    question: (message: string, title: string = "") => {
      return new Promise<DialogResult>((resolve) => {
        const closeHandler = () => {
          mutateMessageBox((state) => {
            state.dialogRef?.removeEventListener("close", closeHandler);
            resolve(state.dialogResult);
          });
        };

        mutateMessageBox((state) => {
          state.type = "question";
          state.message = message;
          state.title = title === "" ? "???" : title;

          state.dialogRef?.addEventListener("close", closeHandler);
          state.dialogRef?.ShowModal().then();
        });
      });
    },

    close: (result?: DialogResult) => {
      mutateMessageBox((state) => {
        state.message = "";
        state.dialogResult = result ?? DialogResult.OK;
        state.dialogRef?.close();
      });
    },
  });

  const mutateMessageBox = createMutator(setMessageBox);

  return { messageBox, mutateMessageBox };
}
