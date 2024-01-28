"use client";
import "./news.scss";
import NewsHeader from "~/assets/images/news-header.png";
import LinkedInIcon from "~/assets/images/linkedin.png";
import FacebookIcon from "~/assets/images/facebook.png";
import TwitterIcon from "~/assets/images/twitter.png";
import InstagramIcon from "~/assets/images/instagram.png";

import { New } from "~/api/types";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import {
  createContext,
  createMemo,
  For,
  Match,
  Switch,
  useContext,
} from "solid-js";
import { createMutator } from "~/utils/utils";
import { createStore } from "solid-js/store";
import Column from "~/components/common/Column";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import Row from "~/components/common/Row";
import Img from "~/components/common/Img";
import Dropdown, { DropdownItem } from "~/components/common/Dropdown";
import { useAppContext } from "~/AppContext";
import Scrollable from "~/components/common/Scrollable";
import LinkedInPost from "~/components/News2/LinkedInPost";
import FacebookPost from "~/components/News2/FacebookPost";
import TwitterPost from "~/components/News2/TwitterPost";
import InstagramPost from "~/components/News2/InstagramPost";

export type CreateNewsDialogResult = {
  result: "Accept" | "Cancel";
  frameWidth: number;
  frameHeight: number;
  sizeUpdateTimer: any;
  previewContainer: HTMLDivElement;
  postHtml: string;
  selectedNewsType:
    | "linkedin"
    | "facebook"
    | "twitter"
    | "instagram"
    | "custom";
  newsTypes: string[];
  newsTypeDisplay: Record<string, { text: string; image: string }>;
};

function createDialogStore() {
  const [state, setState] = createStore<CreateNewsDialogResult>({
    result: "Cancel",
    frameWidth: 500,
    frameHeight: 500,
    sizeUpdateTimer: null,
    previewContainer: null!,
    postHtml: "",
    selectedNewsType: "linkedin",
    newsTypes: ["custom", "linkedin", "facebook", "twitter", "instagram"],
    newsTypeDisplay: {
      custom: {
        text: "Custom",
        image: "",
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

  const mutate = createMutator(setState);

  return { state, mutate };
}

type ContextType = {} & ReturnType<typeof createDialogStore>;

const Context = createContext<ContextType>();

function ContextProvider(props: any) {
  const { state, mutate } = createDialogStore();

  return (
    <Context.Provider value={{ state, mutate }}>
      {props.children}
    </Context.Provider>
  );
}

function useDialogContext() {
  return useContext(Context) as ContextType;
}

export default function (props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditNews ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditNews(props: { ref: DialogRef }) {
  const { state, mutate } = useDialogContext();
  const { user } = useAppContext();

  return (
    <Dialog
      id={"create-news-dialog"}
      class={"create-news-dialog"}
      ref={props.ref}
      onBeforeShow={(ev) => {
        const news = ev.detail as New;
        mutate((state) => {
          if (!news) {
            // open for creating new item
            state.selectedNewsType = "linkedin";
            state.newsTypeDisplay["custom"].image = user()?.photoURL || "";
            state.postHtml = "";
            state.selectedNewsType = "linkedin";
            state.frameHeight = 500;
            state.frameWidth = 500;
          } else {
            // open for updating existing item
            state.newsTypeDisplay["custom"].image = user()?.photoURL || "";
          }
        });
      }}
      onClose={(ev) => {
        const dialog = ev.target as HTMLDialogElement;
        dialog.Resolve(state);
      }}
    >
      <Row class={"title"}>
        Create/Edit News
        <Img src={NewsHeader}></Img>
      </Row>

      <Column class={"content"}>
        <NewsTypeSelection />
        <IFrameInfo />
        <Preview />
        {/* TODO: Add editable custom post similar to a social media post  */}
      </Column>
      <DialogButtons />
    </Dialog>
  );
}

function NewsTypeSelection() {
  const { state, mutate } = useDialogContext();

  return (
    <Dropdown
      rootStyle={{ width: "100%", "z-index": 3 }}
      value={state.selectedNewsType}
      onValueChanged={(e) => {
        mutate((state) => {
          // @ts-ignore
          state.selectedNewsType = e.value;
        });
      }}
    >
      <For each={state.newsTypes}>
        {(newsType) => (
          <DropdownItem value={newsType}>
            <Row class={"dd-item-inner"}>
              <Img src={state.newsTypeDisplay[newsType].image} />
              {state.newsTypeDisplay[newsType].text}
            </Row>
          </DropdownItem>
        )}
      </For>
    </Dropdown>
  );
}

function IFrameInfo() {
  const { state, mutate } = useDialogContext();

  return (
    <Column class={"w-full gap-3"}>
      <textarea
        class={"iframe-editor"}
        spellcheck={false}
        placeholder={"HTML Code"}
        value={state.postHtml}
        onInput={(e) => {
          mutate((state) => {
            state.postHtml = e.currentTarget.value;
          });
        }}
      />
    </Column>
  );
}

function Preview() {
  const { state, mutate } = useDialogContext();

  return (
    <Scrollable
      ref={(el) => {
        mutate((state) => {
          state.previewContainer = el;
        });
      }}
      direction={"vertical"}
      style={{
        // background: "green",
        "padding-top": "10px",
        "padding-bottom": "20px",
        // height: "300px",
        "max-height": "300px",
        width: "100%",
        display: "flex",
        "justify-content": "center",
      }}
    >
      <Switch fallback={null}>
        <Match when={state.selectedNewsType === "linkedin"}>
          <LinkedInPost
            postHtml={state.postHtml}
            width={state.frameWidth}
            height={state.frameHeight}
          />
        </Match>
        <Match when={state.selectedNewsType === "facebook"}>
          <FacebookPost
            postHtml={state.postHtml}
            width={state.frameWidth}
            height={state.frameHeight}
          />
        </Match>
        <Match when={state.selectedNewsType === "twitter"}>
          <TwitterPost
            postHtml={state.postHtml}
            width={state.frameWidth}
            height={state.frameHeight}
          />
        </Match>
        <Match when={state.selectedNewsType === "instagram"}>
          <InstagramPost
            postHtml={state.postHtml}
            width={state.frameWidth}
            height={state.frameHeight}
          />
        </Match>
      </Switch>
      <SizeAdjuster />
    </Scrollable>
  );
}

function SizeAdjuster() {
  const { state, mutate } = useDialogContext();
  return (
    <Column class={"iframe-height-adjustor"}>
      <Button
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          mutate((state) => {
            state.sizeUpdateTimer = setInterval(() => {
              mutate((state) => {
                state.frameHeight -= 1;
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
        value={state.frameHeight}
        onInput={(e) => {
          mutate((state) => {
            state.frameHeight = parseInt(e.currentTarget.value);
          });

          mutate((state) => {
            state.previewContainer.scrollTop =
              state.previewContainer.scrollHeight;
          });
        }}
      />
      {/*<p>{state.frameHeight}</p>*/}
      <Button
        style={{ rotate: "180deg" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          mutate((state) => {
            state.sizeUpdateTimer = setInterval(() => {
              mutate((state) => {
                state.frameHeight += 1;
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

function DialogButtons() {
  const { mutate } = useDialogContext();
  return (
    <>
      <Button
        class={"control-btn accept"}
        onClick={() => {
          mutate((state) => {
            state.result = "Accept";
          });

          const dialog = document.getElementById(
            "create-news-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      >
        <Tick />
      </Button>

      <Button
        class={"control-btn cancel"}
        onClick={() => {
          mutate((state) => {
            state.result = "Cancel";
          });

          const dialog = document.getElementById(
            "create-news-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      >
        <Cross />
      </Button>
    </>
  );
}
