import { For, Match, Show, Switch } from "solid-js";
import { useAppContext } from "~/AppContext";
import Dialog, {
  createDialogContext,
  DialogControls,
  DialogRef,
} from "~/components/common/Dialog";
import { New } from "~/api/types";
import { Timestamp } from "firebase/firestore";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Button from "~/components/common/Button";
import Input from "~/components/common/Input";

import Dropdown, { DropdownItem } from "~/components/common/Dropdown";
import Scrollable from "~/components/common/Scrollable";

import LinkedInPost from "~/components/News/Posts/LinkedInPost";
import FacebookPost from "~/components/News/Posts/FacebookPost";
import TwitterPost from "~/components/News/Posts/TwitterPost";
import InstagramPost from "~/components/News/Posts/InstagramPost";
import CustomPost from "~/components/News/Posts/CustomPost";

import Img from "~/components/common/Img";
import DTULogo from "~/assets/images/dtu-logo.png";
import NewsHeader from "~/assets/images/news-header.png";
import LinkedInIcon from "~/assets/images/linkedin.png";
import FacebookIcon from "~/assets/images/facebook.png";
import TwitterIcon from "~/assets/images/twitter.png";
import InstagramIcon from "~/assets/images/instagram.png";

export type CreateNewsDialogResult = {
  result: "Accept" | "Cancel";
  news: New;
  sizeUpdateTimer: any;
  previewContainer: HTMLDivElement;
  newsTypes: string[];
  newsTypeDisplay: Record<string, { text: string; image: string }>;
};

const { ContextProvider, useDialogContext } =
  createDialogContext<CreateNewsDialogResult>({
    result: "Cancel",
    news: {
      id: "",
      isSelected: false,
      type: "custom",
      postTitle: "",
      avatarUrl: "",
      postHtml: "",
      frameHeight: 500,
      frameWidth: 500,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },

    sizeUpdateTimer: null,
    previewContainer: null!,

    newsTypes: ["custom", "linkedin", "facebook", "twitter", "instagram"],
    newsTypeDisplay: {
      custom: {
        text: "Custom",
        image: DTULogo,
      },
      linkedin: {
        text: "LinkedIn",
        image: LinkedInIcon,
      },
      facebook: {
        text: "Facebook",
        image: FacebookIcon,
      },
      twitter: {
        text: "Twitter",
        image: TwitterIcon,
      },
      instagram: {
        text: "Instagram",
        image: InstagramIcon,
      },
    },
  });

export default function (props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditNews ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditNews(props: { ref: DialogRef }) {
  const { user } = useAppContext();
  const { state, mutate } = useDialogContext();

  return (
    <Show when={state !== undefined}>
      <Dialog
        id={"create-news-dialog"}
        class={"create-news-dialog"}
        ref={props.ref}
        onBeforeShow={(ev) => {
          const news = ev.detail as New;
          mutate((state) => {
            if (!news) {
              // open for creating new item
              state.news.type = "linkedin";
              state.news.isSelected = false;
              state.news.postTitle = "";
              state.news.avatarUrl = user()?.photoURL || "";
              state.news.postHtml = "";
              state.news.updatedAt = Timestamp.now();
              state.news.frameHeight = 500;
              state.news.frameWidth = 500;
              state.result = "Cancel";
            } else {
              // open for updating existing item
              state.news = { ...news };
            }
          });
        }}
        onClose={(ev) => {
          (ev.target as HTMLDialogElement).Resolve(state);
        }}
      >
        <Row class={"title"}>
          Create/Edit News
          <Img src={NewsHeader}></Img>
        </Row>

        <Column class={"content"}>
          <NewsTypeSelection />
          <Switch>
            <Match when={state.news.type === "custom"}>
              <CustomPostInfo />
            </Match>
            <Match when={state.news.type !== "custom"}>
              <SocialMediaPostEmbedCode />
            </Match>
          </Switch>
          <Preview />
        </Column>
        <DialogControls
          disabled={
            (state.news.type === "custom" &&
              (state.news.postTitle === "" || state.news.postHtml === "")) ||
            (state.news.type !== "custom" && state.news.postHtml === "")
          }
          onAccept={() => {
            mutate((state) => {
              state.news.updatedAt = Timestamp.now();
              state.news.isSelected = false;
              state.result = "Accept";
            });

            const dialog = document.getElementById(
              "create-news-dialog",
            ) as HTMLDialogElement | null;
            dialog?.Close();
          }}
          onCancel={() => {
            mutate((state) => {
              state.result = "Cancel";
            });

            const dialog = document.getElementById(
              "create-news-dialog",
            ) as HTMLDialogElement | null;
            dialog?.Close();
          }}
        />
      </Dialog>
    </Show>
  );
}

function NewsTypeSelection() {
  const { state, mutate } = useDialogContext();

  return (
    <Dropdown
      rootStyle={{ width: "100%", "z-index": 3 }}
      value={state.news.type}
      onValueChanged={(e) => {
        mutate((state) => {
          // @ts-ignore
          state.news.type = e.value;
        });
      }}
    >
      <For each={state.newsTypes}>
        {(newsType) => (
          <DropdownItem value={newsType}>
            <Row class={"dropdown-item-inner"}>
              <Img src={state.newsTypeDisplay[newsType].image} />
              {state.newsTypeDisplay[newsType].text}
            </Row>
          </DropdownItem>
        )}
      </For>
    </Dropdown>
  );
}

function CustomPostInfo() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return null;

  return (
    <Column class={"w-full gap-3"}>
      <Input
        class={"w-full"}
        placeholder={"Post title"}
        height={40}
        value={state.news.postTitle}
        onInput={(e) => {
          mutate((state) => {
            state.news.postTitle = e.currentTarget.value;
          });
        }}
      />
      <textarea
        class={"html-code"}
        spellcheck={false}
        placeholder={"Post Html Code"}
        value={state.news.postHtml}
        onInput={(e) => {
          mutate((state) => {
            state.news.postHtml = e.currentTarget.value;
          });
        }}
      />
    </Column>
  );
}

function SocialMediaPostEmbedCode() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return null;

  return (
    <Column class={"w-full gap-3"}>
      <textarea
        class={"html-code"}
        spellcheck={false}
        placeholder={"Post Html Embed Code"}
        value={state.news.postHtml}
        onInput={(e) => {
          mutate((state) => {
            state.news.postHtml = e.currentTarget.value;
          });
        }}
      />
    </Column>
  );
}

function Preview() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return null;

  return (
    <Scrollable
      ref={(el) => {
        mutate((state) => {
          state.previewContainer = el;
        });
      }}
      direction={"vertical"}
      class={"preview"}
    >
      <Switch fallback={null}>
        <Match when={state.news.type === "custom"}>
          <CustomPost
            width={state.news.frameWidth}
            avatarUrl={state.news.avatarUrl}
            title={state.news.postTitle}
            postHtml={state.news.postHtml}
            updatedAt={state.news.updatedAt}
          />
        </Match>
        {/*Social Media Post*/}
        <Match when={state.news.type === "linkedin"}>
          <LinkedInPost
            postHtml={state.news.postHtml}
            width={state.news.frameWidth}
            height={state.news.frameHeight}
          />
        </Match>
        <Match when={state.news.type === "facebook"}>
          <FacebookPost
            postHtml={state.news.postHtml}
            width={state.news.frameWidth}
            height={state.news.frameHeight}
          />
        </Match>
        <Match when={state.news.type === "twitter"}>
          <TwitterPost
            postHtml={state.news.postHtml}
            width={state.news.frameWidth}
            height={state.news.frameHeight}
          />
        </Match>
        <Match when={state.news.type === "instagram"}>
          <InstagramPost
            postHtml={state.news.postHtml}
            width={state.news.frameWidth}
            height={state.news.frameHeight}
          />
        </Match>
      </Switch>
      <Show when={state.news.type !== "custom"}>
        <SizeAdjuster />
      </Show>
    </Scrollable>
  );
}

function SizeAdjuster() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return null;

  return (
    <Column class={"size-adjustor"}>
      <Button
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          mutate((state) => {
            state.sizeUpdateTimer = setInterval(() => {
              mutate((state) => {
                state.news.frameHeight -= 1;
                state.previewContainer.scrollTop =
                  state.previewContainer.scrollHeight;
              });
            }, 20);
          });
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          mutate((state) => {
            clearInterval(state.sizeUpdateTimer);
          });
        }}
      >
        ▲
      </Button>
      <input
        type={"number"}
        value={state.news.frameHeight}
        onInput={(e) => {
          mutate((state) => {
            state.news.frameHeight = parseInt(e.currentTarget.value);
          });

          mutate((state) => {
            state.previewContainer.scrollTop =
              state.previewContainer.scrollHeight;
          });
        }}
      />
      <Button
        style={{ rotate: "180deg" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          mutate((state) => {
            state.sizeUpdateTimer = setInterval(() => {
              mutate((state) => {
                state.news.frameHeight += 1;
                state.previewContainer.scrollTop =
                  state.previewContainer.scrollHeight;
              });
            }, 20);
          });
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          mutate((state) => {
            clearInterval(state.sizeUpdateTimer);
          });
        }}
      >
        ▲
      </Button>
    </Column>
  );
}
