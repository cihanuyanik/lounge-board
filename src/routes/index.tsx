import { Title } from "@solidjs/meta";
import Events from "~/components/Events/Events";
import ResearchGroups from "~/components/ResearchGroups/ResearchGroups";
import News from "~/components/News/News";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
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
  const colorPalette = useColorPaletteTransition({
    colorPalettes: [
      "dtu-red",
      "dtu-blue",
      "dtu-green",
      "dtu-navy-blue",
      "dtu-orange",
      "dtu-purple",
    ],
  });

  onMount(async () => {
    if (isServer) return;
    await waitUntil(() => busyDialog.isValid, 50, 2000);
    await loadData();
  });

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.splice(0, unSubList.length);
  });

  return (
    <main>
      <Title>Lounge Board</Title>
      <div class={`app-container color-palette-transition ${colorPalette()}`}>
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

function useColorPaletteTransition(props: {
  transitionInterval?: number;
  colorPalettes: string[];
}) {
  const [index, setIndex] = createSignal(0);
  let colorPaletteTransitionTimer: NodeJS.Timeout = null!;

  const colorPalette = createMemo(() => {
    return props.colorPalettes[index()];
  });

  onMount(() => {
    colorPaletteTransitionTimer = setInterval(() => {
      setIndex((index() + 1) % props.colorPalettes.length);
    }, props.transitionInterval || 10000);
  });

  onCleanup(() => clearInterval(colorPaletteTransitionTimer));

  return colorPalette;
}
