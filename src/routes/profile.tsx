import "./signup.scss";
import { AppContextProvider, useAppContext } from "~/AppContext";
import { Title } from "@solidjs/meta";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Img from "~/components/common/Img";
import DTULogo from "~/assets/images/dtu-logo.png";
import Button from "~/components/common/Button";
import Edit from "~/assets/icons/Edit";
import ImageCropDialog, { ImageCropResult } from "~/components/ImageCropDialog";
import Input from "~/components/common/Input";
import Email from "~/assets/icons/Email";
import Tick from "~/assets/icons/Tick";
import Footer from "~/components/Footer";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import DefaultAvatar from "~/assets/images/member-placeholder.png";
import { sleep } from "~/utils/utils";
import { useNavigate } from "@solidjs/router";
import Banner from "~/components/Banner";

export default function Home() {
  return (
    <AppContextProvider>
      <_Profile />
    </AppContextProvider>
  );
}

function _Profile() {
  const { user, setUser, API, Executor, messageBox, busyDialog } =
    useAppContext();
  const navigate = useNavigate();

  const unSubList: Unsubscribe[] = [];

  function subscribeToAuthState() {
    unSubList.push(
      API.AuthService.auth.onAuthStateChanged(async (user) => {
        setUser(user!);
      }),
    );
  }

  onMount(async () => {
    subscribeToAuthState();
    // Wait for a little to let BusyDialog to be rendered
    await sleep(200);
    busyDialog.show("Loading profile...");

    // Wait for the user to be set
    let tryCount = 0;
    while (!user() && tryCount < 10) {
      await sleep(200);
      tryCount++;
    }

    busyDialog.close();

    if (!user()) {
      navigate("/admin");
    }
  });

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.splice(0, unSubList.length);
  });

  createEffect(async () => {
    if (user()) {
      batch(() => {
        setName(user().displayName || "");
        setAvatar(user().photoURL || DefaultAvatar);
        setIsProviderUpdatable(false);
      });

      const providerUserInfos = user().providerData;
      if (!providerUserInfos || providerUserInfos.length === 0) {
        const dResult = await messageBox.question(
          "No provider info found for the user!, Please login with proper account!",
        );

        if (dResult === "Yes") {
          navigate("/admin");
        } else {
          messageBox.warning("You cannot make update without proper account!");
        }
        return;
      }

      if (providerUserInfos[0].providerId !== "password") {
        messageBox.warning(
          `You cannot update an externally (${providerUserInfos[0].providerId}) provided user information`,
        );
        return;
      }

      setIsProviderUpdatable(true);
    }
  });

  const [isProviderUpdatable, setIsProviderUpdatable] = createSignal(false);
  const [avatar, setAvatar] = createSignal<string>(
    user()?.photoURL || DefaultAvatar,
  );
  const [name, setName] = createSignal<string>(user()?.displayName || "");

  // Create a derived signal to set disable state of the button
  const isProfileUpdateDisabled = createMemo(
    () => !isProviderUpdatable() || name() === "" || avatar() === DefaultAvatar,
  );

  async function onImageSelected() {
    if (!imageSelectInput.files) return;
    if (imageSelectInput.files.length === 0) return;
    if (
      imageSelectInput.files[0].type !== "image/png" &&
      imageSelectInput.files[0].type !== "image/jpeg"
    )
      return;

    const image = imageSelectInput.files[0];
    const reader = new FileReader();
    const result = await reader.readAsyncAsDataURL(image);
    if (!result || typeof result !== "string" || result === "") return;

    const dResult = await imageCropDialog.ShowModal<ImageCropResult>(result);
    if (dResult.result === "Cancel") return;
    setAvatar(dResult.croppedImage);
  }

  let imageSelectInput: HTMLInputElement = null!;
  let imageCropDialog: HTMLDialogElement = null!;

  return (
    <main>
      <Title>Lounge Board - Profile</Title>
      <Column class={"app-container sign-up-container"}>
        <Banner title={"Update Profile"} user={user()} />

        <Column class={"input-form"}>
          <Row class={"profile-image"}>
            <Img src={avatar()} />
            <Show when={isProviderUpdatable()}>
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
            </Show>
          </Row>
          <Input
            label={"Full Name"}
            type={"text"}
            placeholder={"... Your full name ..."}
            class={"w-full"}
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            disabled={!isProviderUpdatable()}
          />

          <Row class={"w-full"}>
            <Button
              class={"button-rect green"}
              onClick={async () => {
                await Executor.run(
                  async () => {
                    await Executor.run(
                      async () => {
                        await API.AuthService.updateProfile(name(), avatar());
                        await API.AuthService.user?.reload();
                        navigate("/admin");
                      },
                      {
                        busyDialogMessage: "Updating profile...",
                      },
                    );
                  },
                  {
                    busyDialogMessage: "Updating profile...",
                  },
                );
              }}
              disabled={isProfileUpdateDisabled()}
            >
              Update Profile
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
