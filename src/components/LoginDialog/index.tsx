import "./index.css";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import Input from "~/components/common/Input";
import Email from "~/assets/icons/Email";
import Password from "~/assets/icons/Password";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import { useAppContext } from "~/AppContext";
import { useNavigate } from "@solidjs/router";
import { batch, createMemo, createSignal } from "solid-js";

export default function (props: { ref?: DialogRef }) {
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
      <Row class={"title"}>{"Login"}</Row>

      <Column class={"login-dialog"}>
        <Input
          label={"E-mail"}
          type={"email"}
          placeholder={"... user-email@dtu.dk ..."}
          class={"w-full"}
          icon={Email}
          value={email()}
          onInput={(ev) => {
            setEmail(ev.target.value);
          }}
        />
        <Input
          label={"Password"}
          type={"password"}
          placeholder={"... A strong password ..."}
          class={"w-full"}
          icon={Password}
          value={password()}
          onInput={(ev) => {
            setPassword(ev.target.value);
          }}
        />

        <Row class={"w-full"}>
          <Button
            class={"button-rect green"}
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

        <Row class={"gap-1"}>
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
      </Column>
    </Dialog>
  );
}
