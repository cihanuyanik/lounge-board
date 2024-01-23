import "./news.scss";
import Button from "~/components/common/Button";
import { Accessor, createContext, createMemo, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import CalendarDate from "~/assets/icons/CalendarDate";
import Clock from "~/assets/icons/Clock";
import { createMutator, toDate } from "~/utils/utils";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import { New } from "~/api/types";
import Dialog, { DialogRef } from "~/components/common/Dialog";

export type CreateNewsDialogResult = {
  result: "Accept" | "Cancel";
  news: New;
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

export default function CreateEditNews(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditNews ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditNews(props: {
  ref: HTMLDialogElement | ((el: HTMLDialogElement) => void);
}) {
  const { state, mutate, dateStr, timeStr } = useDialogContext();

  let textRef: HTMLTextAreaElement;

  return (
    <Dialog
      id={"create-news-dialog"}
      class={"create-news-dialog"}
      ref={props.ref}
      onBeforeShow={(ev) => {
        const news = ev.detail as New;

        if (!news) {
          // open for creating new item
          mutate((state) => {
            state.news = {
              id: "",
              text: "",
              // @ts-ignore
              createdAt: new Date(),
              isSelected: false,
            };
          });
        } else {
          // open for updating existing item
          mutate((state) => {
            state.news = { ...news };
          });
        }
      }}
      onAfterShow={() => {
        textRef.style.height = "auto";
        textRef.style.height = textRef.scrollHeight + "px";
      }}
      onClose={(ev) => {
        (ev.target as HTMLDialogElement).Resolve(state);
      }}
    >
      <Column class={"content"}>
        <Row class={"w-full"}>
          <textarea
            ref={(el) => (textRef = el)}
            value={state.news.text}
            placeholder={"News content..."}
            onInput={(e) => {
              mutate((state) => {
                state.news.text = e.currentTarget.value;
              });
              textRef.style.height = "auto";
              textRef.style.height = textRef.scrollHeight + "px";
            }}
            class={"text"}
          />
        </Row>

        <Row class={"time"}>
          <CalendarDate />
          <p>{dateStr()}</p>

          {timeStr() && (
            <>
              <p> --- </p>
              <Clock />
              <p>{timeStr()}</p>
            </>
          )}
        </Row>
      </Column>
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
    </Dialog>
  );
}
