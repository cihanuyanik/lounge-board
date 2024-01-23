import { Title } from "@solidjs/meta";
import Events from "~/components/Events/Events";
import ResearchGroups from "~/components/ResearchGroups/ResearchGroups";
import News from "~/components/News/News";
import { onCleanup, onMount } from "solid-js";
import { AppContextProvider, useDataLoader } from "~/AppContext";
import Members from "~/components/Members/Members";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Banner from "~/components/Banner";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import Footer from "~/components/Footer";
import { isServer } from "solid-js/web";
import { sleep } from "~/utils/utils";

export default function Home() {
  return (
    <AppContextProvider>
      <_Home />
    </AppContextProvider>
  );
}

function _Home() {
  const { loadData, unSubList } = useDataLoader();

  onMount(async () => {
    if (isServer) return;
    // Wait for 100ms to let BusyDialog object to be created
    await sleep(100);
    await loadData();
  });

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.splice(0, unSubList.length);
  });

  return (
    <main>
      <Title>Lounge Board</Title>
      <div class="app-container">
        <Banner />
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
      </div>
    </main>
  );
}
