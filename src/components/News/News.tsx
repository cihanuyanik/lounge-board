import "./news.css";
import BlockContainer from "~/components/common/BlockContainer";
import Img from "~/components/common/Img";
import NewsHeader from "~/assets/images/news-header.png";
import Scrollable from "~/components/common/Scrollable";
import { For, onCleanup, onMount, Show } from "solid-js";
import { useAppContext } from "~/AppContext";
import CreateEditNews, {
  CreateNewsDialogResult,
} from "~/components/News/CreateEditNews";
import NewsItem from "~/components/News/NewsItem";
import { DialogResult } from "~/components/MessageBox/store";
import { scrollWithAnimation, sleep } from "~/utils/utils";

export default function News() {
  const { isAdmin, messageBox, busyDialog, API, news } = useAppContext();
  let newsAnimationContainer: HTMLDivElement = null!;
  let newsScrollableContainer: HTMLDivElement = null!;
  let newsDialog: HTMLDialogElement = null!;
  let scrollAnimation: Animation | undefined;
  let scrollAnimationTimer: NodeJS.Timeout = null!;

  onMount(async () => {
    if (isAdmin()) {
      // If landed on admin page, don't run scroll animation
    } else {
      onMountClient().then();
    }
  });

  async function onMountClient() {
    // Wait for news to be loaded
    await sleep(3000);

    // Run scroll animation
    runScrollAnimation();
  }

  onCleanup(() => {
    // Stop restart timer
    if (scrollAnimationTimer) {
      clearTimeout(scrollAnimationTimer);
    }

    // Cancel active animation
    if (scrollAnimation && scrollAnimation.playState !== "finished") {
      scrollAnimation.cancel();
    }
  });

  function runScrollAnimation() {
    // Start animation and wait for it to finish
    try {
      scrollAnimation = scrollWithAnimation({
        animationContainer: newsAnimationContainer,
        scrollDirection: "down",
        totalItemDistance: newsAnimationContainer.scrollHeight,
        viewPortDistance: newsScrollableContainer.clientHeight - 16,
        pixelsPerSecondToScroll: 50,
        stayAtRestDurationInMsAfterScroll: 3000,
        pixelsPerSecondToReturnBack: 1000,
      });

      scrollAnimation?.finished.then(() => {
        // Restart animation after 3 seconds
        scrollAnimationTimer = setTimeout(() => {
          runScrollAnimation();
        }, 3000);
      });
    } catch (e) {
      console.error("Scroll animation failed at News container: ", e);
    }
  }

  async function onAddNew() {
    const dResult = await newsDialog.ShowModal<CreateNewsDialogResult>();
    if (dResult.result === "Cancel") return;

    try {
      busyDialog.show("Creating news...");

      await API.News.add({ ...dResult.news });

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  async function onDeleteSelected() {
    try {
      if (news.selectedIds.length === 0) return;

      const dResult = await messageBox.question(
        "Are you sure you want to delete news?",
      );
      if (dResult === DialogResult.No) return;

      API.News.beginTransaction();
      for (const id of news.selectedIds) {
        await API.News.delete(news.entities[id]);
      }
      await API.News.commitTransaction();
    } catch (e) {
      messageBox.error(`${e}`);
    }
  }

  const icon = <Img src={NewsHeader} style={{ height: "35px" }} />;

  return (
    <BlockContainer
      title={"News"}
      titleIcon={icon}
      onAddNewItem={isAdmin() ? onAddNew : undefined}
      onDeleteSelectedItems={isAdmin() ? onDeleteSelected : undefined}
      class={"news-block-container"}
    >
      <Scrollable
        ref={newsScrollableContainer}
        direction={"vertical"}
        hideScrollbar={true}
        class={"news-scrollable-container"}
      >
        <div
          ref={newsAnimationContainer}
          class={"news-scroll-animation-wrapper"}
        >
          <For each={news.ids}>
            {(id, index) => (
              <NewsItem id={id} index={index} editDialog={newsDialog} />
            )}
          </For>
        </div>
      </Scrollable>
      <Show when={isAdmin()}>
        <CreateEditNews ref={newsDialog} />
      </Show>
    </BlockContainer>
  );
}
