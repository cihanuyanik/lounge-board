import { isServer } from "solid-js/web";

export {};

declare global {
  interface HTMLDialogElement {
    ShowModal<ResultType>(dialogArgs?: any): Promise<ResultType>;
    Close(): void;
    Resolve(dialogResult?: any): void;
  }
}

if (!isServer) {
  HTMLDialogElement.prototype.ShowModal = function (dialogArgs) {
    return new Promise((resolve) => {
      // Set the resolve function
      this.Resolve = resolve;

      // Dispatch the event before showing the dialog

      this.dispatchEvent(
        new CustomEvent("before-show", { detail: dialogArgs }),
      );

      // Show the dialog with an animation
      this.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 250,
      });
      this.showModal();

      // Dispatch the event after showing the dialog
      this.dispatchEvent(new CustomEvent("after-show", { detail: dialogArgs }));
    });
  };

  HTMLDialogElement.prototype.Close = function () {
    // Hide the dialog with an animation
    this.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 250,
    }).onfinish = () => {
      this.close();
      // Dispatch the event before closing the dialog
      this.dispatchEvent(new CustomEvent("close-modal"));
    };
  };
}
