import "./signup.scss";
import { AppContextProvider, useAppContext } from "~/AppContext";
import { Title } from "@solidjs/meta";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Input from "~/components/common/Input";
import Email from "~/assets/icons/Email";
import Password from "~/assets/icons/Password";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import DTULogo from "~/assets/images/dtu-logo.png";
import Img from "~/components/common/Img";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import DefaultAvatar from "~/assets/images/member-placeholder.png";
import Edit from "~/assets/icons/Edit";
import ImageCropDialog, { ImageCropResult } from "~/components/ImageCropDialog";
import { createMemo, createSignal } from "solid-js";
import Footer from "~/components/Footer";
import { useNavigate } from "@solidjs/router";

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

  let imageSelectInput: HTMLInputElement = null!;
  let imageCropDialog: HTMLDialogElement = null!;

  function onImageSelected() {
    if (!imageSelectInput.files) return;
    if (imageSelectInput.files.length === 0) return;
    if (
      imageSelectInput.files[0].type !== "image/png" &&
      imageSelectInput.files[0].type !== "image/jpeg"
    )
      return;

    const image = imageSelectInput.files[0];
    const reader = new FileReader();

    reader.onload = async (ev) => {
      if (ev.target === null) return;
      const dResult = await imageCropDialog.ShowModal<ImageCropResult>(
        ev.target?.result as string,
      );
      if (dResult.result === "Cancel") return;
      setAvatar(dResult.croppedImage);
    };

    reader.readAsDataURL(image);
  }

  return (
    <main>
      <Title>Lounge Board - Sign up</Title>
      <Column class={"sign-up-container"}>
        <Row class={"title"}>
          <Img src={DTULogo} width={50} />
          <p>Sign-up</p>
        </Row>

        <Column class={"input-form"}>
          <Row class={"profile-image"}>
            <Img src={avatar()} />
            <Button onClick={() => imageSelectInput.click()}>
              <Edit />
            </Button>
            <input
              ref={(el) => (imageSelectInput = el)}
              type="file"
              accept="image/png, image/jpeg"
              hidden
              onClick={(e) => (e.currentTarget.value = "")}
              onInput={onImageSelected}
            />

            <ImageCropDialog
              ref={imageCropDialog}
              aspectRatio={250 / 300}
              rounded={"full"}
            />
          </Row>
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
              class={"button-rect green"}
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
