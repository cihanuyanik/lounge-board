import { Title } from "@solidjs/meta";
import Members from "~/components/Members/Members";
import ResearchGroups from "~/components/ResearchGroups/ResearchGroups";
import News from "~/components/News2/News";
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

export default function Home() {
  return (
    <AppContextProvider>
      <_Admin />
    </AppContextProvider>
  );
}

function _Admin() {
  const { busyDialog, user, setUser, API } = useAppContext();
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
      await sleep(100);
      busyDialog.show("Signing in...");
      await sleep(1000);
      busyDialog.close();
    } catch (e) {
      busyDialog.close();
    } finally {
      if (!user()) {
        await loginDialog.ShowModal<User>();
      }
    }
  });

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.splice(0, unSubList.length);
  });

  createEffect(async () => {
    if (!isServer) {
      if (user()) {
        await loadData();
      }
    }
  });

  let loginDialog: HTMLDialogElement = null!;

  return (
    <main>
      <Title>Lounge Board - Admin</Title>
      <div class="app-container">
        <Banner user={user()} />
        <Row class={"flex-1 w-full gap-2"}>
          <Members />
          <Column class={"flex-1 h-full gap-2"}>
            <ResearchGroups />
            <News />
          </Column>
          <Events />
        </Row>
        <Footer />
        <BusyDialog />
        <MessageBox />
        <LoginDialog ref={loginDialog} />
      </div>
    </main>
  );
}
