import { Accessor, Match, Show, Switch } from "solid-js";
import { useAppContext } from "~/AppContext";
import Row from "~/components/common/Row";
import LinkedInPost from "~/components/News/Posts/LinkedInPost";
import FacebookPost from "~/components/News/Posts/FacebookPost";
import TwitterPost from "~/components/News/Posts/TwitterPost";
import InstagramPost from "~/components/News/Posts/InstagramPost";
import { CreateNewsDialogResult } from "~/components/News/CreateEditNews";
import CustomPost from "~/components/News/Posts/CustomPost";
import Tick from "~/assets/icons/Tick";
import { detectChanges } from "~/utils/utils";

type NewsItemProps = {
  id: string;
  index: Accessor<number>;
  editDialog: HTMLDialogElement;
};

export default function NewsItem(props: NewsItemProps) {
  const { isAdmin, news, Executor, API } = useAppContext();

  return (
    <Row
      class={"news-item"}
      classList={{
        "item-selected": news.entities[props.id].isSelected,
        "cursor-pointer": isAdmin(),
      }}
      onClick={
        !isAdmin()
          ? undefined
          : () => {
              const newItem = news.entities[props.id];
              if (newItem.isSelected) news.unselect(props.id);
              else news.select(props.id);
            }
      }
      onDblClick={
        !isAdmin()
          ? undefined
          : async () => {
              const dResult =
                await props.editDialog.ShowModal<CreateNewsDialogResult>(
                  news.entities[props.id],
                );
              if (dResult.result === "Cancel") return;

              await Executor.run(
                async () => {
                  const original = news.entities[props.id];
                  const changes = detectChanges(original, dResult.news);

                  await API.News.update({
                    original,
                    changes,
                  });
                },
                {
                  busyDialogMessage: "Updating news...",
                },
              );
            }
      }
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
      <Show when={isAdmin() && news.entities[props.id]?.isSelected}>
        <Row class={"item-selected-marker"}>
          <Tick />
        </Row>
      </Show>
    </Row>
  );
}
