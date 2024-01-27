import "./news.scss";
import { For, onCleanup, onMount, Show } from "solid-js";
import NewItem from "~/components/News/NewItem";
import Img from "~/components/common/Img";
import NewsHeader from "~/assets/images/news-header.png";
import { scrollBottomAnimation } from "~/utils/utils";
import { DialogResult } from "~/components/MessageBox/store";
import Scrollable from "~/components/common/Scrollable";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";
import CreateEditNews, {
  CreateNewsDialogResult,
} from "~/components/News/CreateEditNews";

export default function News() {
  const { isAdmin, messageBox, news, API } = useAppContext();

  let newsRef: HTMLDivElement;
  let timeOut: any;
  let createNewDialog: HTMLDialogElement = null!;

  async function scroll() {
    await scrollBottomAnimation(newsRef, 3000);
    timeOut = setTimeout(scroll, 5000);
  }

  onMount(() => {
    if (isAdmin()) return;
    timeOut = setTimeout(scroll, 5000);
  });

  onCleanup(() => clearTimeout(timeOut));

  async function onAddNew() {
    // const dialogResult = await createNewDialog.show();
    const dialogResult =
      await createNewDialog.ShowModal<CreateNewsDialogResult>();
    if (dialogResult.result === "Cancel") return;

    try {
      await API.News.add({
        text: dialogResult.news.text,
        isSelected: false,
      });
    } catch (e) {
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
      class={"flex-1 w-full"}
    >
      <Scrollable
        ref={(el) => (newsRef = el)}
        direction={"vertical"}
        hideScrollbar={true}
        class={"news-container"}
      >
        <For each={news.ids}>
          {(id, index) => (
            <NewItem id={id} index={index} editDialog={createNewDialog} />
          )}
        </For>
      </Scrollable>
      <Show when={isAdmin()}>
        <CreateEditNews ref={createNewDialog} />
      </Show>
    </BlockContainer>
  );
}
