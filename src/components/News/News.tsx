import styles from "./news.module.scss";
import BlockContainer from "~/components/common/BlockContainer";
import NewsHeader from "~/assets/images/news-header.png";
import Scrollable from "~/components/common/Scrollable";
import { For, onCleanup, onMount, Show } from "solid-js";
import { useAppContext } from "~/AppContext";
import CreateEditNews from "~/components/News/CreateEditNews";
import NewsItem from "~/components/News/NewsItem";
import { DialogResult } from "~/components/MessageBox/store";
import ContinuesScrollAnimator from "~/utils/ContinuesScrollAnimator";
import { sleep } from "~/utils/utils";

export default function News() {
  const { isAdmin, messageBox, Executor, API, news } = useAppContext();
  let newsAnimationContainer: HTMLDivElement = null!;
  let newsScrollableContainer: HTMLDivElement = null!;
  let newsDialog: HTMLDialogElement = null!;

  let scrollAnimator: ContinuesScrollAnimator = null!;

  onMount(async () => {
    if (!isAdmin()) {
      onMountClient().then();
    }
  });

  async function onMountClient() {
    // Wait for news to be loaded
    await sleep(3000);

    scrollAnimator = new ContinuesScrollAnimator({
      animationContainer: () => newsAnimationContainer,
      scrollDirection: "down",
      totalItemDistance: () => newsAnimationContainer.scrollHeight,
      viewPortDistance: () => newsScrollableContainer.clientHeight - 16,
      pixelsPerSecondToScroll: 25,
      stayAtRestDurationInMsAfterScroll: 3000,
      pixelsPerSecondToReturnBack: 1000,
    });
    scrollAnimator.run().then();
  }

  onCleanup(() => scrollAnimator?.stop());

  return (
    <BlockContainer
      as={"news-block"}
      title={"News"}
      titleIcon={NewsHeader}
      class={styles.blockContainer}
      popupDirection={"bottom-left"}
      onAddNewItem={!isAdmin() ? undefined : () => newsDialog.ShowModal()}
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
        as={"scrollable"}
        ref={newsScrollableContainer}
        hideScrollbar={true}
        class={styles.scrollable}
      >
        {/*@ts-ignore*/}
        <scroll-wrapper ref={newsAnimationContainer} class={styles.wrapper}>
          <For each={news.ids}>
            {(id, index) => (
              <NewsItem id={id} index={index} editDialog={newsDialog} />
            )}
          </For>
          {/*@ts-ignore*/}
        </scroll-wrapper>
      </Scrollable>
      <Show when={isAdmin()}>
        <CreateEditNews ref={newsDialog} />
      </Show>
    </BlockContainer>
  );
}
