import { Accessor, Match, Switch } from "solid-js";
import { useAppContext } from "~/AppContext";
import Row from "~/components/common/Row";
import LinkedInPost from "~/components/News/Posts/LinkedInPost";
import FacebookPost from "~/components/News/Posts/FacebookPost";
import TwitterPost from "~/components/News/Posts/TwitterPost";
import InstagramPost from "~/components/News/Posts/InstagramPost";
import { CreateNewsDialogResult } from "~/components/News/CreateEditNews";
import { New } from "~/api/types";
import CustomPost from "~/components/News/Posts/CustomPost";
import { Timestamp } from "firebase/firestore";

type NewsItemProps = {
  id: string;
  index: Accessor<number>;
  editDialog?: HTMLDialogElement;
};

export default function NewsItem(props: NewsItemProps) {
  const { isAdmin, busyDialog, messageBox, news, API } = useAppContext();

  function onClick() {
    const newItem = news.entities[props.id];
    if (newItem.isSelected) news.unselect(props.id);
    else news.select(props.id);
  }

  async function onDoubleClick() {
    if (!props.editDialog) return;

    const dResult = await props.editDialog.ShowModal<CreateNewsDialogResult>(
      news.entities[props.id],
    );
    if (dResult.result === "Cancel") return;

    try {
      busyDialog.show("Updating news...");

      const original = news.entities[props.id];
      const changes = {} as Partial<New>;

      changes.isSelected = false;
      changes.updatedAt = Timestamp.now();
      if (dResult.news.type !== original.type) {
        changes.type = dResult.news.type;
      }
      if (dResult.news.postTitle !== original.postTitle) {
        changes.postTitle = dResult.news.postTitle;
      }
      if (dResult.news.avatarUrl !== original.avatarUrl) {
        changes.avatarUrl = dResult.news.avatarUrl;
      }
      if (dResult.news.postHtml !== original.postHtml) {
        changes.postHtml = dResult.news.postHtml;
      }
      if (dResult.news.frameHeight !== original.frameHeight) {
        changes.frameHeight = dResult.news.frameHeight;
      }
      if (dResult.news.frameWidth !== original.frameWidth) {
        changes.frameWidth = dResult.news.frameWidth;
      }

      await API.News.update({
        original,
        changes,
      });

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  return (
    <Row
      class={"news-item"}
      classList={{
        "item-selected": news.entities[props.id].isSelected,
        "cursor-pointer": isAdmin(),
      }}
      onClick={isAdmin() ? onClick : undefined}
      onDblClick={isAdmin() ? onDoubleClick : undefined}
    >
      <Switch fallback={<></>}>
        <Match when={news.entities[props.id].type === "custom"}>
          <CustomPost
            title={news.entities[props.id].postTitle}
            postHtml={news.entities[props.id].postHtml}
            width={news.entities[props.id].frameWidth}
            avatarUrl={news.entities[props.id].avatarUrl}
            updatedAt={news.entities[props.id].updatedAt}
          />
        </Match>
        <Match when={news.entities[props.id].type === "linkedin"}>
          <LinkedInPost
            postHtml={news.entities[props.id].postHtml}
            width={news.entities[props.id].frameWidth}
            height={news.entities[props.id].frameHeight}
            scrolling={"no"}
            style={{ "border-radius": "5px" }}
          />
        </Match>
        <Match when={news.entities[props.id].type === "facebook"}>
          <FacebookPost
            postHtml={news.entities[props.id].postHtml}
            width={news.entities[props.id].frameWidth}
            height={news.entities[props.id].frameHeight}
            scrolling={"no"}
            style={{ "border-radius": "5px" }}
          />
        </Match>
        <Match when={news.entities[props.id].type === "twitter"}>
          <TwitterPost
            postHtml={news.entities[props.id].postHtml}
            width={news.entities[props.id].frameWidth}
            height={news.entities[props.id].frameHeight}
            scrolling={"no"}
            style={{ "border-radius": "5px" }}
          />
        </Match>
        <Match when={news.entities[props.id].type === "instagram"}>
          <InstagramPost
            postHtml={news.entities[props.id].postHtml}
            width={news.entities[props.id].frameWidth}
            height={news.entities[props.id].frameHeight}
            scrolling={"no"}
            style={{ "border-radius": "5px" }}
          />
        </Match>
      </Switch>
    </Row>
  );
}
