import styles from "./signup.module.scss";
import { AppContextProvider, useAppContext } from "~/AppContext";
import { Title } from "@solidjs/meta";
import Row from "~/components/common/Flex/Row";
import Column from "~/components/common/Flex/Column";
import Input from "~/components/common/Input";
import Email from "~/assets/icons/Email";
import Password from "~/assets/icons/Password";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import DefaultAvatar from "~/assets/images/member-placeholder.png";
import { createMemo, createSignal } from "solid-js";
import Footer from "~/components/Footer";
import { useNavigate } from "@solidjs/router";
import Banner from "~/components/Banner";
import Avatar from "~/components/common/Avatar";

export default function Home() {
  return (
    <AppContextProvider>
      <_Signup />
    </AppContextProvider>
  );
}

function _Signup() {
  const { API, Executor } = useAppContext();
  const navigate = useNavigate();

  const [avatar, setAvatar] = createSignal<string>(DefaultAvatar);
  const [name, setName] = createSignal<string>("");
  const [email, setEmail] = createSignal<string>("");
  const [password, setPassword] = createSignal<string>("");

  const isEmailValid = createMemo(() => {
    // Has to contain @ and end with dtu.dk
    return email().includes("@") && email().endsWith("dtu.dk");
  });

  const isPasswordValid = createMemo(() => {
    // Has to be at least 6 characters long
    return password().length >= 6;
  });

  // Create a derived signal to set disable state of the button
  const isSignUpDisabled = createMemo(() => {
    return (
      name() === "" ||
      !isEmailValid() ||
      !isPasswordValid() ||
      avatar() === DefaultAvatar
    );
  });

  return (
    <main>
      <Title>Lounge Board - Sign up</Title>
      <Column class={`App ${styles.container}`}>
        <Banner title={"Sign-up"} />

        <Column class={styles.form}>
          <Avatar
            imgSrc={avatar()}
            enableImageSelect={true}
            enableImageCrop={true}
            onImageSelected={(image) => setAvatar(image)}
            class={styles.avatar}
          />
          <Input
            label={"Full Name"}
            type={"text"}
            placeholder={"... Your full name ..."}
            class={"w-full"}
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
          />

          <Input
            label={"E-mail"}
            type={"email"}
            placeholder={"... user-email@dtu.dk ..."}
            class={"w-full"}
            icon={Email}
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
          <Input
            label={"Password"}
            type={"password"}
            placeholder={"... A strong password ..."}
            class={"w-full"}
            icon={Password}
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />

          <Row class={"w-full"}>
            <Button
              class={styles.green}
              rectangle
              onClick={async () => {
                await Executor.run(
                  async () => {
                    await API.AuthService.signUp(email(), password());
                    await API.AuthService.updateProfile(name(), avatar());
                    await API.AuthService.verifyEmail();
                  },
                  {
                    busyDialogMessage: "Signing up...",
                    postAction: () => {
                      navigate("/admin");
                    },
                  },
                );
              }}
              disabled={isSignUpDisabled()}
            >
              Signup
              <Tick />
            </Button>
          </Row>
        </Column>
        <Footer />
      </Column>

      <BusyDialog />
      <MessageBox />
    </main>
  );
}
