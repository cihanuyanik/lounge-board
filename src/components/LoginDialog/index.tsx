import "./index.scss";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import Input from "~/components/common/Input";
import Email from "~/assets/icons/Email";
import Password from "~/assets/icons/Password";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import { API } from "~/api/Firebase";
import { useAppContext } from "~/AppContext";

type Props = {
  ref?: DialogRef;
};

export default function (props: Props) {
  const { busyDialog, messageBox } = useAppContext();
  let email: HTMLInputElement = null!;
  let password: HTMLInputElement = null!;
  let loggedInUser: any = null;

  async function trySignUp() {
    try {
      // Try to signup first
      await API.AuthService.signUp(email.value, password.value);
      // If successful, login
      return "success";
    } catch (error: any) {
      if (error.code) return error.code;
      else return `${error}`;
    }
  }

  async function trySignIn() {
    try {
      await API.AuthService.signIn(email.value, password.value);
      return "success";
    } catch (error: any) {
      if (error.code) return error.code;
      else return `${error}`;
    }
  }

  async function onLogin() {
    const dialog = document.getElementById(
      "login-dialog",
    ) as HTMLDialogElement | null;

    if (!dialog) return;

    try {
      busyDialog.show("Logging in...");
      if (!email.value.endsWith("@dtu.dk")) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("You must use a DTU email to sign in");
      }

      const result = await trySignUp();
      if (result === "success") {
        loggedInUser = API.AuthService.user;
        busyDialog.close();
        dialog?.Close();
        return;
      } else if (result === "auth/email-already-in-use") {
        const result = await trySignIn();
        if (result === "success") {
          loggedInUser = API.AuthService.user;
          busyDialog.close();
          dialog?.Close();
          return;
        } else {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(result);
        }
      } else {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(result);
      }
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  return (
    <Dialog
      id={"login-dialog"}
      ref={props.ref}
      onBeforeShow={() => {
        // Clear input fields and output user
        email.value = "";
        password.value = "";
        loggedInUser = null;
      }}
      onClose={(ev) => (ev.target as HTMLDialogElement)?.Resolve(loggedInUser)}
    >
      <Row class={"title"}>{"Login / Sign-up"}</Row>

      <Column class={"login-dialog"}>
        <Input
          ref={email}
          label={"E-mail"}
          type={"email"}
          placeholder={"... user-email@dtu.dk ..."}
          class={"w-full"}
          icon={Email}
        />
        <Input
          ref={password}
          label={"Password"}
          type={"password"}
          placeholder={"... A strong password ..."}
          class={"w-full"}
          icon={Password}
        />

        <Row class={"w-full"}>
          <Button class={"button-rect green"} onClick={onLogin}>
            Login
            <Tick />
          </Button>
        </Row>
      </Column>
    </Dialog>
  );
}
