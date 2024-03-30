import styles from "./news.module.scss";

import { Accessor, Match, Switch } from "solid-js";
import { useAppContext } from "~/AppContext";
import Row from "~/components/common/Flex/Row";
import LinkedInPost from "~/components/News/Posts/LinkedInPost";
import FacebookPost from "~/components/News/Posts/FacebookPost";
import TwitterPost from "~/components/News/Posts/TwitterPost";
import InstagramPost from "~/components/News/Posts/InstagramPost";
import CustomPost from "~/components/News/Posts/CustomPost";
import SelectedMarker from "~/components/SelectedMarker";

type NewsItemProps = {
  id: string;
  index: Accessor<number>;
  editDialog: HTMLDialogElement;
};

export default function NewsItem(props: NewsItemProps) {
  const { isAdmin, news } = useAppContext();

  return (
    <Row
      as={"news-item"}
      classList={{
        [styles.newsItem]: true,
        [styles.selected]: news.entities[props.id].isSelected,
        [styles.pointer]: isAdmin(),
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
          : () => props.editDialog.ShowModal(news.entities[props.id])
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
      <SelectedMarker
        visible={isAdmin() && news.entities[props.id]?.isSelected}
      />
    </Row>
  );
}
