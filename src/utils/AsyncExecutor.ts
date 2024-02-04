import { FirebaseErrorCodeMap } from "~/api/ErrorCodes";

type BusyDialog = {
  isOpen: boolean;
  show: (message: string) => void;
  close: () => void;
};

type MessageBox = {
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  close: () => void;
};

export default class {
  private busyDialog: BusyDialog;
  private messageBox: MessageBox;
  constructor(busyDialog: BusyDialog, messageBox: MessageBox) {
    this.busyDialog = busyDialog;
    this.messageBox = messageBox;
  }

  public async run<T>(
    action: () => Promise<T>,
    options?: {
      busyDialogMessage?: string;
      successMessage?: string;
      postAction?: (actionResult: T) => Promise<void> | void;
    },
  ) {
    try {
      if (options?.busyDialogMessage)
        this.busyDialog.show(options.busyDialogMessage);

      const actionResult: T = await action();

      if (this.busyDialog.isOpen) this.busyDialog.close();
      if (options?.successMessage)
        this.messageBox.success(options.successMessage);

      if (options?.postAction) await options.postAction(actionResult);
    } catch (e: any) {
      if (this.busyDialog.isOpen) this.busyDialog.close();

      if (typeof e === "string") {
        // If thrown error is a plain string
        this.messageBox.error(e);
      } else if (
        typeof e === "object" &&
        e.message &&
        !e.message.startsWith("Firebase")
      ) {
        // if thrown error is an object with a message property and non-firebase error
        this.messageBox.error(e.message);
      } else if (
        typeof e === "object" &&
        e.message &&
        e.message.startsWith("Firebase") &&
        e.code
      ) {
        let mboxProps = FirebaseErrorCodeMap.get(e.code);
        if (!mboxProps) {
          mboxProps = { message: e.code, title: "Firebase Error" };
        }
        this.messageBox.error(mboxProps.message, mboxProps.title);
      } else {
        // If thrown error type is not known
        this.messageBox.error(`${e}`);
      }
    }
  }
}
