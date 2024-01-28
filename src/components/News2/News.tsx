import "./news.scss";
import BlockContainer from "~/components/common/BlockContainer";
import Img from "~/components/common/Img";
import NewsHeader from "~/assets/images/news-header.png";
import Scrollable from "~/components/common/Scrollable";
import { For, Show } from "solid-js";
import { useAppContext } from "~/AppContext";
import CreateEditNews, {
  CreateNewsDialogResult,
} from "~/components/News2/CreateEditNews";
import { Timestamp } from "firebase/firestore";
import LinkedInPost from "~/components/News2/LinkedInPost";
import FacebookPost from "~/components/News2/FacebookPost";
import TwitterPost from "~/components/News2/TwitterPost";
import InstagramPost from "~/components/News2/InstagramPost";

export default function News() {
  const { isAdmin, messageBox, busyDialog, API, news } = useAppContext();
  let newsRef: HTMLDivElement = null!;
  let newsDialog: HTMLDialogElement = null!;

  async function onAddNew() {
    console.log("onAddNew");
    const dResult = await newsDialog.ShowModal<CreateNewsDialogResult>();
    if (dResult.result === "Cancel") return;

    try {
      busyDialog.show("Creating news...");
      if (dResult.selectedNewsType === "custom") {
        // Create custom news
      } else {
        await API.News.add({
          text: "",
          isSelected: false,
          type: dResult.selectedNewsType,
          postHtml: dResult.postHtml,
          frameHeight: dResult.frameHeight,
          frameWidth: dResult.frameWidth,
          updatedAt: Timestamp.now(),
        });
      }

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
    console.log("Save news");
    console.log(dResult);
  }

  async function onDeleteSelected() {
    console.log("onDeleteSelected");
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
        ref={newsRef}
        direction={"vertical"}
        hideScrollbar={true}
        class={"news-container"}
      >
        <For each={news.ids}>
          {(id) => {
            // TODO: Make them selectable to be deleted. Possibly by wrappig them with a div

            switch (news.entities[id].type) {
              case "linkedin":
                return (
                  <LinkedInPost
                    postHtml={news.entities[id].postHtml}
                    width={news.entities[id].frameWidth}
                    height={news.entities[id].frameHeight}
                    scrolling={"no"}
                    style={{ "border-radius": "5px" }}
                  />
                );
              case "facebook":
                return (
                  <FacebookPost
                    postHtml={news.entities[id].postHtml}
                    width={news.entities[id].frameWidth}
                    height={news.entities[id].frameHeight}
                    scrolling={"no"}
                    style={{ "border-radius": "5px" }}
                  />
                );
              case "twitter":
                return (
                  <TwitterPost
                    postHtml={news.entities[id].postHtml}
                    width={news.entities[id].frameWidth}
                    height={news.entities[id].frameHeight}
                    scrolling={"no"}
                    style={{ "border-radius": "5px" }}
                  />
                );
              case "instagram":
                return (
                  <InstagramPost
                    postHtml={news.entities[id].postHtml}
                    width={news.entities[id].frameWidth}
                    height={news.entities[id].frameHeight}
                    scrolling={"no"}
                    style={{ "border-radius": "5px" }}
                  />
                );
            }
          }}
        </For>
      </Scrollable>
      <Show when={isAdmin()}>
        <CreateEditNews ref={newsDialog} />
      </Show>
    </BlockContainer>
  );
}
