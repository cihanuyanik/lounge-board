import styles from "./index.module.scss";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import Input from "~/components/common/Input";
import Email from "~/assets/icons/Email";
import Password from "~/assets/icons/Password";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import { useAppContext } from "~/AppContext";
import { useNavigate } from "@solidjs/router";
import { batch, createMemo, createSignal } from "solid-js";
import Img from "~/components/common/Img";
import GoogleLogo from "~/assets/images/google.png";
import MicrosoftLogo from "~/assets/images/microsoft.png";
import GitHubLogo from "~/assets/images/github.png";

export default function LoginDialog(props: { ref?: DialogRef }) {
  const { API, Executor } = useAppContext();
  const navigate = useNavigate();

  let loggedInUser: any = null;

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const isEmailValid = createMemo(() => {
    // Has to contain @ and end with dtu.dk
    return email().includes("@") && email().endsWith("dtu.dk");
  });

  const isPasswordValid = createMemo(() => {
    // Has to be at least 6 characters long
    return password().length >= 6;
  });

  const inputsValid = createMemo(() => {
    // Both email and password have to be valid
    return !isEmailValid() || !isPasswordValid();
  });

  return (
    <Dialog
      id={"login-dialog"}
      ref={props.ref}
      class={styles.LoginDialog}
      onBeforeShow={() => {
        // Clear input fields and output user
        batch(() => {
          setEmail("");
          setPassword("");
        });

        loggedInUser = null;
      }}
      onClose={(ev) => (ev.target as HTMLDialogElement)?.Resolve(loggedInUser)}
    >
      <Row as={"dialog-title"} class={styles.title}>
        {"Login"}
      </Row>
      <Column as={"dialog-content"} class={styles.content}>
        <Input
          width={"full"}
          label={"E-mail"}
          type={"email"}
          placeholder={"... user-email@dtu.dk ..."}
          icon={Email}
          value={email()}
          onInput={(ev) => {
            setEmail(ev.target.value);
          }}
        />
        <Input
          width={"full"}
          label={"Password"}
          type={"password"}
          placeholder={"... A strong password ..."}
          icon={Password}
          value={password()}
          onInput={(ev) => {
            setPassword(ev.target.value);
          }}
        />

        <Row width={"full"}>
          <Button
            class={styles.green}
            rectangle
            onClick={async () => {
              const dialog = document.getElementById(
                "login-dialog",
              ) as HTMLDialogElement | null;

              if (!dialog) return;

              await Executor.run(
                () => API.AuthService.signIn(email(), password()),
                {
                  busyDialogMessage: "Logging in...",
                  postAction: (userCredential) => {
                    loggedInUser = userCredential.user;
                    dialog?.Close();
                  },
                },
              );
            }}
            disabled={inputsValid()}
          >
            Login
            <Tick />
          </Button>
        </Row>

        <Row as={"no-account"} gap={"1"}>
          <p>{"Don't have an account? "}</p>
          <p
            style={{
              "text-decoration": "underline",
              color: "var(--color-tertiary)",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign up
          </p>
        </Row>

        <Column as={"external-provider"} class={styles.externalProviderLogin}>
          <p>Or you can login with:</p>
          <Button
            rectangle
            onClick={async () => {
              const dialog = document.getElementById(
                "login-dialog",
              ) as HTMLDialogElement | null;

              if (!dialog) return;

              await Executor.run(() => API.AuthService.signInWithGoogle(), {
                postAction: (userCredential) => {
                  loggedInUser = userCredential.user;
                  dialog?.Close();
                },
              });
            }}
          >
            <Img src={GoogleLogo} />
            Google
          </Button>
          <Button
            rectangle
            onClick={async () => {
              const dialog = document.getElementById(
                "login-dialog",
              ) as HTMLDialogElement | null;

              if (!dialog) return;

              await Executor.run(() => API.AuthService.signInWithMicrosoft(), {
                postAction: (userCredential) => {
                  loggedInUser = userCredential.user;
                  dialog?.Close();
                },
              });
            }}
          >
            <Img src={MicrosoftLogo} />
            Microsoft
          </Button>
          <Button
            rectangle
            onClick={async () => {
              const dialog = document.getElementById(
                "login-dialog",
              ) as HTMLDialogElement | null;

              if (!dialog) return;

              await Executor.run(() => API.AuthService.signInWithGitHub(), {
                postAction: (userCredential) => {
                  loggedInUser = userCredential.user;
                  dialog?.Close();
                },
              });
            }}
          >
            <Img src={GitHubLogo} />
            GitHub
          </Button>
        </Column>
      </Column>
    </Dialog>
  );
}
