import "./index.css";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import EmailVerificationImage from "~/assets/images/email-verification.png";
import Button from "~/components/common/Button";
import Email from "~/assets/icons/Email";
import Cross from "~/assets/icons/Cross";
import Tick from "~/assets/icons/Tick";
import { useAppContext } from "~/AppContext";

type Props = {
  ref: DialogRef;
};

export type EmailVerificationDialogResult = "Cancel" | "Verified";

export default function (props: Props) {
  const { busyDialog, messageBox, API } = useAppContext();

  let dialogResult: EmailVerificationDialogResult = "Cancel";

  async function onResendVerification() {
    try {
      busyDialog.show("Resending verification email...");

      await API.AuthService.verifyEmail();

      busyDialog.close();
      messageBox.success("Verification email sent to your email address!");
    } catch (e) {
      busyDialog.close();
      messageBox.error(`Failed to resend verification email: ${e}`);
    }
  }

  async function onVerified() {
    if (API.AuthService.user) {
      await API.AuthService.user.reload();
      if (API.AuthService.user.emailVerified) {
        dialogResult = "Verified";
        const dialog = document.getElementById(
          "email-verification-dialog",
        ) as HTMLDialogElement | null;
        dialog?.Close();
      } else {
        messageBox.error("Email is still not verified!");
      }
    }
  }

  return (
    <Dialog
      id={"email-verification-dialog"}
      ref={props.ref}
      class={"email-verification-dialog"}
      onBeforeShow={() => {
        dialogResult = "Cancel";
      }}
      onClose={(ev) => (ev.target as HTMLDialogElement)?.Resolve(dialogResult)}
    >
      <Column>
        <Row class={"title"}>Email Verification Required!</Row>

        <Column class={"message"}>
          <img
            src={EmailVerificationImage}
            alt={"verify-email"}
            height={"70px"}
            width={"70px"}
          />
          <p>
            Please <span>check your email</span> & click the link to{" "}
            <span>verify and activate</span> your account.
          </p>
          <p>
            If you don't see the email in your inbox, please also check{" "}
            <span>your spam/junk</span> folder.
          </p>
          <p>
            If you still can't find the email, or didn't{" "}
            <span>receive it within 5 minutes</span> for some reason, please
            click the button below to <span>resend</span> the verification
            email.
          </p>
          <Button class={"button-rect resend"} onClick={onResendVerification}>
            <Email />
            Resend verification Email
          </Button>
        </Column>
      </Column>
      <Row class={"control-buttons"}>
        <Button class={"button-rect green"} onClick={onVerified}>
          <Tick />
          Verified!
        </Button>
        <Button
          class={"button-rect red"}
          onClick={() => {
            const dialog = document.getElementById(
              "email-verification-dialog",
            ) as HTMLDialogElement | null;
            dialog?.Close();
          }}
        >
          <Cross />
          Cancel verification
        </Button>
      </Row>
    </Dialog>
  );
}
