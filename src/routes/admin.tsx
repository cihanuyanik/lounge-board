import { Title } from "@solidjs/meta";
import Members from "~/components/Members/Members";
import ResearchGroups from "~/components/ResearchGroups/ResearchGroups";
import News from "~/components/News/News";
import Events from "~/components/Events/Events";
import { onCleanup, onMount } from "solid-js";
import { AppContextProvider, useAppContext, useDataLoader } from "~/AppContext";
import Row from "~/components/common/Flex/Row";
import Column from "~/components/common/Flex/Column";
import Banner from "~/components/Banner";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import Footer from "~/components/Footer";
import { isServer } from "solid-js/web";
import { waitUntil } from "~/utils/utils";
import LoginDialog from "~/components/LoginDialog";
import { User } from "~/api/types";
import EmailVerificationDialog, {
  EmailVerificationDialogResult,
} from "~/components/EmailVerificationDialog";

export default function Home() {
  return (
    <AppContextProvider>
      <_Admin />
    </AppContextProvider>
  );
}

function _Admin() {
  const { user, setUser, Executor, API, messageBox, busyDialog } =
    useAppContext();
  const { loadData, unSubList } = useDataLoader();

  function subscribeToAuthState() {
    unSubList.push(
      API.AuthService.auth.onAuthStateChanged(async (user) => {
        setUser(user!);
      }),
    );
  }

  async function login() {
    if (!user()) {
      await loginDialog.ShowModal<User>();
    }
  }

  async function checkEmailVerification() {
    // Check email verification status
    if (!API.AuthService.isUserVerified()) {
      const dResult =
        await emailVerificationDialog.ShowModal<EmailVerificationDialogResult>();
      if (dResult === "Cancel") {
        // Messagebox for showing you must verify your email
        messageBox.warning(
          "You have to verify your email to use the admin features",
        );
      }

      if (dResult === "Verified") {
        messageBox.success(
          "Email verified successfully. You can use admin features now",
        );
      }
    }
  }

  onMount(async () => {
    if (isServer) return;

    await waitUntil(() => busyDialog.isValid, 50, 2000);

    await Executor.run(
      async () => {
        subscribeToAuthState();

        // Wait for user to be set by checking it out, it will wait 2secs in total
        await waitUntil(
          () => user() !== null && user() !== undefined,
          50,
          2000,
        );
      },
      {
        busyDialogMessage: "Signing in...",
        postAction: async () => {
          await login();
          await checkEmailVerification();
          if (API.AuthService.isUserVerified()) {
            setUser({ ...API.AuthService.user! } as User);
            await loadData();
          }
        },
      },
    );
  });

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.splice(0, unSubList.length);
  });

  let loginDialog: HTMLDialogElement = null!;
  let emailVerificationDialog: HTMLDialogElement = null!;

  return (
    <main>
      <Title>Lounge Board - Admin</Title>
      <div class="App">
        <Banner
          title={"Digital Health - Admin"}
          user={user()}
          showResearchGroups={true}
        />
        <Row class={"flex-1 w-full gap-2"}>
          <Members />
          <Column class={"flex-1 h-full gap-2"}>
            <ResearchGroups />
            <Events />
          </Column>
          <News />
        </Row>
        <Footer />

        <BusyDialog />
        <MessageBox />
        <LoginDialog ref={loginDialog} />
        <EmailVerificationDialog ref={emailVerificationDialog} />
        {/*<HoverPopup />*/}
      </div>
    </main>
  );
}
