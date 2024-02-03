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
  const { isAdmin, messageBox, Executor, API, news } = useAppContext();
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
    runScrollAnimation().then();
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

  // TODO: This part and Member scroll: Maybe they can be refactored into a single component
  async function runScrollAnimation() {
    // Start animation and wait for it to finish
    try {
      scrollAnimation = scrollWithAnimation({
        animationContainer: newsAnimationContainer,
        scrollDirection: "down",
        totalItemDistance: newsAnimationContainer.scrollHeight,
        viewPortDistance: newsScrollableContainer.clientHeight - 16,
        pixelsPerSecondToScroll: 25,
        stayAtRestDurationInMsAfterScroll: 3000,
        pixelsPerSecondToReturnBack: 1000,
      });

      await scrollAnimation?.finished;

      // Restart animation after 3 seconds
      scrollAnimationTimer = setTimeout(() => {
        runScrollAnimation();
      }, 3000);
    } catch (e) {
      // Try to restart animation after 60 seconds
      scrollAnimationTimer = setTimeout(() => {
        runScrollAnimation();
      }, 60000);
    }
  }

  const icon = <Img src={NewsHeader} style={{ height: "35px" }} />;

  return (
    <BlockContainer
      title={"News"}
      titleIcon={icon}
      class={"news-block-container"}
      onAddNewItem={
        !isAdmin()
          ? undefined
          : async () => {
              const dResult =
                await newsDialog.ShowModal<CreateNewsDialogResult>();
              if (dResult.result === "Cancel") return;

              await Executor.run(() => API.News.add({ ...dResult.news }), {
                busyDialogMessage: "Creating news...",
              });
            }
      }
      onDeleteSelectedItems={
        !isAdmin()
          ? undefined
          : async () => {
              if (news.selectedIds.length === 0) return;

              const dResult = await messageBox.question(
                "Are you sure you want to delete news?",
              );
              if (dResult === DialogResult.No) return;

              await Executor.run(() => API.News.deleteMany(news.selectedIds), {
                busyDialogMessage: "Deleting news...",
              });
            }
      }
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
