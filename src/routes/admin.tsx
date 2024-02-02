import { Title } from "@solidjs/meta";
import Members from "~/components/Members/Members";
import ResearchGroups from "~/components/ResearchGroups/ResearchGroups";
import News from "~/components/News/News";
import Events from "~/components/Events/Events";
import { createEffect, onCleanup, onMount } from "solid-js";
import { AppContextProvider, useAppContext, useDataLoader } from "~/AppContext";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Banner from "~/components/Banner";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import Footer from "~/components/Footer";
import { isServer } from "solid-js/web";
import { sleep } from "~/utils/utils";
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
  const { busyDialog, user, setUser, API, messageBox } = useAppContext();
  const { loadData, unSubList } = useDataLoader();

  onMount(async () => {
    if (isServer) return;

    try {
      unSubList.push(
        API.AuthService.auth.onAuthStateChanged(async (user) => {
          if (user) {
            // Logged in
            setUser(user);
          } else {
            // Logged out
            setUser(null!);
          }
        }),
      );

      // Wait for 100ms to let BusyDialog object to be created
      await sleep(200);
      busyDialog.show("Signing in...");

      // Wait for user to be set by checking it out, it will wait 2secs in total
      let checkCount = 0;
      while (!user() && checkCount < 20) {
        await sleep(100);
        checkCount++;
      }

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
    } finally {
      if (!user()) {
        await loginDialog.ShowModal<User>();
      }

      // Check email verification status
      if (user() && !user().emailVerified) {
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

      if (user() && user().emailVerified) {
        await loadData();
      }
    }
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
      <div class="app-container">
        <Banner user={user()} />
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
      </div>
    </main>
  );
}
