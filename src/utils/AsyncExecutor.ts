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
        // if thrown error is a firebase error
        // Map firebase error to a user friendly message
        switch (e.code) {
          // Firebase Auth errors
          case "auth/invalid-credential":
            this.messageBox.error(
              "Please check your E-mail and Password. Login information is wrong!",
              "Login failed",
            );
            break;
          case "auth/email-already-in-use":
            this.messageBox.error(
              "The email address is already in use by another account.",
              "Sign up failed",
            );
            break;
          case "auth/invalid-email":
            this.messageBox.error(
              "The email address is badly formatted.",
              "Sign up failed",
            );
            break;
          case "auth/weak-password":
            this.messageBox.error(
              "The password is too weak. It should be at least 6 characters.",
              "Sign up failed",
            );
            break;
          case "auth/user-not-found":
            this.messageBox.error(
              "There is no user record corresponding to this identifier. The user may have been deleted.",
              "Login failed",
            );
            break;
          case "auth/too-many-requests":
            this.messageBox.error(
              "Too many request has been made from this device. Please wait little bit more to let previous requests to be completed.",
              "Too many requests",
            );
            break;
          // Storage errors
          case "storage/unauthorized":
            this.messageBox.error(
              "User doesn't have permission to access the object",
              "Unauthorized",
            );
            break;
          case "storage/retry-limit-exceeded":
            this.messageBox.error(
              "The operation retry limit has been exceeded.",
              "Retry limit exceeded",
            );
            break;
          case "storage/invalid-checksum":
            this.messageBox.error(
              "The uploaded file has an invalid checksum.",
              "Invalid checksum",
            );
            break;
          case "storage/canceled":
            this.messageBox.error("The operation was canceled.", "Canceled");
            break;
          case "storage/object-not-found":
            this.messageBox.error(
              "The image does not exist.",
              "Image not found",
            );
            break;
          case "storage/bucket-not-found":
            this.messageBox.error(
              "The storage bucket information is wrong.",
              "Bucket not found",
            );
            break;
          case "storage/project-not-found":
            this.messageBox.error(
              "The storage project information is wrong or the project has been deleted.",
              "Project not found",
            );
            break;
          case "storage/quota-exceeded":
            this.messageBox.error(
              "The operation could not be completed due to exceeding the storage quota.",
              "Quota exceeded",
            );
            break;
          case "storage/unauthenticated":
            this.messageBox.error(
              "User is unauthenticated for this operation.",
              "Unauthenticated",
            );
            break;
          case "storage/invalid-argument":
            this.messageBox.error(
              "The operation failed due to an invalid argument.",
              "Invalid argument",
            );
            break;
          case "storage/internal-error":
            this.messageBox.error(
              "The operation failed due to an internal error.",
              "Internal error",
            );
            break;
          case "storage/invalid-url":
            this.messageBox.error(
              "The operation failed, given URL is invalid.",
              "Invalid URL",
            );
            break;

          // Firestore errors
          case "firestore/permission-denied":
            this.messageBox.error(
              "The operation was denied by the server. Please check your permissions.",
              "Permission denied",
            );
            break;
          case "firestore/aborted":
            this.messageBox.error(
              "The operation was aborted. Please try again.",
              "Aborted",
            );
            break;
          case "firestore/unavailable":
            this.messageBox.error(
              "The service is currently unavailable. Please try again later.",
              "Unavailable",
            );
            break;
          case "firestore/data-loss":
            this.messageBox.error(
              "Unrecoverable data loss or corruption. Please contact support.",
              "Data loss",
            );
            break;
          // Default
          default:
            this.messageBox.error(e.code, "Error");
            break;
        }
      } else {
        // If thrown error type is not known
        this.messageBox.error(`${e}`);
      }
    }
  }
}
