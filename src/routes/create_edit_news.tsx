import "./create_edit_news.scss";
import Row from "~/components/common/Row";
import Img from "~/components/common/Img";
import NewsHeader from "~/assets/images/news-header.png";
import Column from "~/components/common/Column";
import Dropdown, { DropdownItem } from "~/components/common/Dropdown";
import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  For,
  Show,
  useContext,
} from "solid-js";
import Scrollable from "~/components/common/Scrollable";
import Button from "~/components/common/Button";
import { New } from "~/api/types";
import { createStore } from "solid-js/store";
import LinkedInIcon from "~/assets/images/linkedin.png";
import FacebookIcon from "~/assets/images/facebook.png";
import TwitterIcon from "~/assets/images/twitter.png";
import InstagramIcon from "~/assets/images/instagram.png";
import { createMutator, toDate } from "~/utils/utils";
import { DialogRef } from "~/components/common/Dialog";
import { isServer } from "solid-js/web";
import DTULogo from "~/assets/images/dtu-logo.png";
import Logout from "~/assets/icons/Logout";

export type CreateNewsDialogResult = {
  result: "Accept" | "Cancel";
  news: New;
  frameHeight: number;
  sizeUpdateTimer: any;
  // iframeUrl: string;
  // iframeHtml: string;
  // iframeHtmlTemplate: string;
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
    news: {
      id: "",
      text: "",
      // @ts-ignore
      createdAt: null,
      isSelected: false,
    },
    frameHeight: 200,
    sizeUpdateTimer: null,
    iframeUrl: "",
    iframeHtml: "",
    iframeHtmlTemplate: `<iframe src="URL"/>`,
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

type ContextType = {
  dateStr: Accessor<string>;
  timeStr: Accessor<string | undefined>;
} & ReturnType<typeof createDialogStore>;

const Context = createContext<ContextType>();

function ContextProvider(props: any) {
  const { state, mutate } = createDialogStore();

  const dateStr = createMemo(() => {
    const date = toDate(state.news.createdAt);
    if (date === undefined) return "";

    return date.toLocaleDateString("en-UK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  });

  const timeStr = createMemo(() => {
    const date = toDate(state.news.createdAt);
    if (date === undefined) return "";

    let timeStr: string | undefined = date.toLocaleTimeString("en-UK", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (timeStr === "00:00") timeStr = undefined;

    return timeStr;
  });

  return (
    <Context.Provider value={{ state, mutate, dateStr, timeStr }}>
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
      <CreateEditNews ref={props.ref} />
    </ContextProvider>
  );
}

function CreateEditNews() {
  return (
    <div class={"create-edit-news"}>
      <Row class={"title w-full gap-2"}>
        <Row>Create/Edit News</Row>
        <Img src={NewsHeader}></Img>
      </Row>

      <Column class={"content"}>
        <NewsTypeSelection />

        {/*TODO: Make this conditionally displayed*/}
        <IFrameInfo />

        <Preview />
        {/* TODO: Add editable custom post similar to a social media post  */}
      </Column>
    </div>
  );
}

function NewsTypeSelection() {
  const { state, mutate } = useDialogContext();

  return (
    <Dropdown rootStyle={{ width: "100%", "z-index": 3 }}>
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

  // const parser = new DOMParser();

  return (
    <Column class={"w-full gap-3"}>
      {/*<Input*/}
      {/*  class={"w-full"}*/}
      {/*  height={36}*/}
      {/*  placeholder={"IFrame URL"}*/}
      {/*  value={state.iframeUrl}*/}
      {/*  onInput={(e) => {*/}
      {/*    mutate((state) => {*/}
      {/*      state.iframeUrl = e.currentTarget.value;*/}
      {/*      state.iframeHtml = state.iframeHtmlTemplate.replace(*/}
      {/*        "URL",*/}
      {/*        state.iframeUrl,*/}
      {/*      );*/}
      {/*    });*/}
      {/*  }}*/}
      {/*/>*/}
      <textarea
        class={"iframe-editor"}
        spellcheck={false}
        placeholder={"HTML Code"}
        value={state.postHtml}
        onInput={(e) => {
          mutate((state) => {
            state.postHtml = e.currentTarget.value;
            // state.iframeHtml = e.currentTarget.value;
            // try {
            //   const iframeNode = parser.parseFromString(
            //     state.iframeHtml,
            //     "text/html",
            //   ).body.firstChild as HTMLIFrameElement;
            //   if (iframeNode === null) return;
            //   state.iframeUrl = iframeNode.src;
            // } catch (e) {
            //   // skip
            // }
          });
        }}
      />
    </Column>
  );
}

function Preview() {
  const { state, mutate } = useDialogContext();

  const prevInfo = createMemo(() => {
    if (isServer) return;
    console.log("postHtml: ", state.postHtml);
    const parser = new DOMParser();
    const dom = parser.parseFromString(state.postHtml, "text/html");
    const height = dom.body.clientHeight;
    const width = dom.body.clientWidth;
    console.log("height: ", height);
    console.log("width: ", width);
    return {
      srcDoc: state.postHtml,
      dom: dom,
      height: height,
      width: width,
    };
  });

  createEffect(() => {
    // if (doc() instanceof HTMLIFrameElement) {
    //   console.log("iframe found: ", state.selectedNewsType);
    // }
    // console.log(doc());
    // document.getElementById("container")?.firstChild?.remove();
    // document.getElementById("container")?.append(doc());
  });

  return <iframe width={500} height={600} srcdoc={state.postHtml}></iframe>;

  return (
    <Scrollable
      direction={"vertical"}
      class={"pos-rel"}
      hideScrollbar={true}
      style={{ width: "500px", "max-height": "500px" }}
    >
      <blockquote class="twitter-tweet">
        <p lang="en" dir="ltr">
          Never search &quot;Klopp&quot; in the GIFs tab. Worst decision of my
          life!
          <br />{" "}
          <a href="https://t.co/s9usRHDRSc">pic.twitter.com/s9usRHDRSc</a>
        </p>
        &mdash; RMA_Thierros (@RMA_Thierros){" "}
        <a href="https://twitter.com/RMA_Thierros/status/1750942557167636986?ref_src=twsrc%5Etfw">
          January 26, 2024
        </a>
      </blockquote>
      <script
        async
        src="https://platform.twitter.com/widgets.js"
        charset="utf-8"
      ></script>

      {/*<For each={Array.from(doc())}>{(node) => node}</For>*/}
      {/*{doc()}*/}
      {/*<IFrame*/}
      {/*  src={state.iframeUrl}*/}
      {/*  minHeight={state.frameHeight}*/}
      {/*  class={"w-full"}*/}
      {/*  // scrolling={"no"}*/}
      {/*/>*/}
      {/*<SizeAdjuster />*/}
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
              mutate((state) => (state.frameHeight -= 1));
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
        }}
      />
      {/*<p>{state.frameHeight}</p>*/}
      <Button
        style={{ rotate: "180deg" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          mutate((state) => {
            state.sizeUpdateTimer = setInterval(() => {
              mutate((state) => (state.frameHeight += 1));
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
