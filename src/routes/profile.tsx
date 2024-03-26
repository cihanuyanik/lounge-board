import styles from "./signup.module.scss";
import { AppContextProvider, useAppContext } from "~/AppContext";
import { Title } from "@solidjs/meta";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Button from "~/components/common/Button";
import Input from "~/components/common/Input";
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
} from "solid-js";
import DefaultAvatar from "~/assets/images/member-placeholder.png";
import { waitUntil } from "~/utils/utils";
import { useNavigate } from "@solidjs/router";
import Banner from "~/components/Banner";
import { isServer } from "solid-js/web";
import Avatar from "~/components/common/Avatar";

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
    if (isServer) return;
    subscribeToAuthState();
    await waitUntil(() => busyDialog.isValid, 50, 2000);
    busyDialog.show("Loading profile...");

    // Wait for the user to be set
    await waitUntil(() => user() !== null && user() !== undefined, 50, 2000);

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

  return (
    <main>
      <Title>Lounge Board - Profile</Title>
      <Column class={`App ${styles.container}`}>
        <Banner title={"Update Profile"} user={user()} />

        <Column class={styles.form}>
          <Avatar
            imgSrc={avatar()}
            enableImageSelect={isProviderUpdatable()}
            enableImageCrop={isProviderUpdatable()}
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
            disabled={!isProviderUpdatable()}
          />

          <Row class={"w-full"}>
            <Button
              class={styles.green}
              rectangle
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
