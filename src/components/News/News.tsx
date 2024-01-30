import "./news.css";
import BlockContainer from "~/components/common/BlockContainer";
import Img from "~/components/common/Img";
import NewsHeader from "~/assets/images/news-header.png";
import Scrollable from "~/components/common/Scrollable";
import { For, Show } from "solid-js";
import { useAppContext } from "~/AppContext";
import CreateEditNews, {
  CreateNewsDialogResult,
} from "~/components/News/CreateEditNews";
import NewsItem from "~/components/News/NewsItem";
import { DialogResult } from "~/components/MessageBox/store";

export default function News() {
  const { isAdmin, messageBox, busyDialog, API, news } = useAppContext();
  let newsRef: HTMLDivElement = null!;
  let newsDialog: HTMLDialogElement = null!;

  // TODO: Scroll animation is required to be implemented

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
      class={"h-full"}
    >
      <Scrollable
        ref={newsRef}
        direction={"vertical"}
        hideScrollbar={true}
        class={"news-container"}
      >
        <For each={news.ids}>
          {(id, index) => (
            <NewsItem id={id} index={index} editDialog={newsDialog} />
          )}
        </For>
      </Scrollable>
      <Show when={isAdmin()}>
        <CreateEditNews ref={newsDialog} />
      </Show>
    </BlockContainer>
  );
}
