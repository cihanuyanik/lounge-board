import { Accessor, JSX, Match, Switch } from "solid-js";
import { useAppContext } from "~/AppContext";
import Row from "~/components/common/Row";
import LinkedInPost from "~/components/News/Posts/LinkedInPost";
import FacebookPost from "~/components/News/Posts/FacebookPost";
import TwitterPost from "~/components/News/Posts/TwitterPost";
import InstagramPost from "~/components/News/Posts/InstagramPost";
import { IFramePostProps } from "~/components/News/Posts/IFramePost";
import { CreateNewsDialogResult } from "~/components/News/CreateEditNews";
import { Timestamp } from "firebase/firestore";
import { New } from "~/api/types";

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

      if (dResult.selectedNewsType === "custom") {
        // TODO: Handle for custom type
      } else {
        const original = news.entities[props.id];
        const changes = {} as Partial<New>;
        changes.text = "";
        changes.isSelected = false;
        if (dResult.selectedNewsType !== original.type) {
          changes.type = dResult.selectedNewsType;
        }
        if (dResult.postHtml !== original.postHtml) {
          changes.postHtml = dResult.postHtml;
        }
        if (dResult.frameHeight !== original.frameHeight) {
          changes.frameHeight = dResult.frameHeight;
        }
        if (dResult.frameWidth !== original.frameWidth) {
          changes.frameWidth = dResult.frameWidth;
        }
        changes.updatedAt = Timestamp.now();

        await API.News.update({
          original,
          changes,
        });
      }

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  const SocialMediaPostMap: Record<
    string,
    (props: Omit<IFramePostProps, "baseUrl" | "expInternalType">) => JSX.Element
  > = {
    linkedin: LinkedInPost,
    facebook: FacebookPost,
    twitter: TwitterPost,
    instagram: InstagramPost,
  };

  return (
    <Switch fallback={<></>}>
      <Match when={news.entities[props.id].type === "custom"}>
        <div>Custom News Item</div>
      </Match>
      {/*Social Media Post*/}
      <Match when={news.entities[props.id].type !== "custom"}>
        <Row
          class={"news-item"}
          classList={{
            "item-selected": news.entities[props.id].isSelected,
            "cursor-pointer": isAdmin(),
          }}
          onClick={isAdmin() ? onClick : undefined}
          onDblClick={isAdmin() ? onDoubleClick : undefined}
        >
          {SocialMediaPostMap[news.entities[props.id].type]({
            postHtml: news.entities[props.id].postHtml,
            width: news.entities[props.id].frameWidth,
            height: news.entities[props.id].frameHeight,
            scrolling: "no",
            style: { "border-radius": "5px" },
          })}
        </Row>
      </Match>
    </Switch>
  );
}
