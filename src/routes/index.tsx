import { Title } from "@solidjs/meta";
import Events from "~/components/Events/Events";
import ResearchGroups from "~/components/ResearchGroups/ResearchGroups";
import News from "~/components/News/News";
import { onCleanup, onMount } from "solid-js";
import { AppContextProvider, useAppContext, useDataLoader } from "~/AppContext";
import Members from "~/components/Members/Members";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Banner from "~/components/Banner";
import BusyDialog from "~/components/BusyDialog";
import MessageBox from "~/components/MessageBox";
import Footer from "~/components/Footer";
import { isServer } from "solid-js/web";
import { waitUntil } from "~/utils/utils";

export default function Home() {
  return (
    <AppContextProvider>
      <_Home />
    </AppContextProvider>
  );
}

function _Home() {
  const { busyDialog } = useAppContext();
  const { loadData, unSubList } = useDataLoader();

  // Color palette alter animation
  const colorPalettes = [
    "dtu-blue",
    "dtu-green",
    "dtu-navy-blue",
    "dtu-orange",
    "dtu-purple",
    "dtu-red",
  ];
  let colorPaletteIndex = 0;
  let colorPaletteTransitionTimer: NodeJS.Timeout = null!;

  onMount(async () => {
    if (isServer) return;
    await waitUntil(() => busyDialog.isValid, 50, 2000);
    await loadData();

    colorPaletteTransitionTimer = setInterval(() => {
      // Remove current color palette from class list
      appContainer.classList.remove(colorPalettes[colorPaletteIndex]);
      // Add next color palette to class list
      colorPaletteIndex = (colorPaletteIndex + 1) % colorPalettes.length;
      appContainer.classList.add(colorPalettes[colorPaletteIndex]);
    }, 10000);
  });

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.splice(0, unSubList.length);
    clearInterval(colorPaletteTransitionTimer);
  });

  let appContainer: HTMLDivElement = null!;

  return (
    <main>
      <Title>Lounge Board</Title>
      <div ref={appContainer} class="app-container color-palette-transition">
        <Banner title={"Digital Health"} showResearchGroups={true} />
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
      </div>
    </main>
  );
}
