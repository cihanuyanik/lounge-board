import "./events.scss";
import Button from "~/components/common/Button";
import { createStore } from "solid-js/store";
import { Accessor, createContext, createMemo, useContext } from "solid-js";
import { Event } from "~/api/types";
import { createMutator, toDate } from "~/utils/utils";
import DateInput from "~/components/common/DateInput";
import TimeInput from "~/components/common/TimeInput";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import Dialog, { DialogRef } from "~/components/common/Dialog";

export type CreateEventDialogResult = {
  result: "Accept" | "Cancel";
  event: Event;
  type: "upcoming" | "past";
};

function createDialogStore() {
  const [state, setState] = createStore<CreateEventDialogResult>({
    result: "Cancel",
    event: {
      id: "",
      text: "",
      // @ts-ignore
      startsAt: new Date(),
      // @ts-ignore
      endsAt: null,
      isSelected: false,
    },
    type: "upcoming",
  });

  const mutate = createMutator(setState);

  return { state, mutate };
}

type ContextType = {
  startDate: Accessor<string>;
  startTime: Accessor<string>;
  endDate: Accessor<string>;
  endTime: Accessor<string>;
  minDate: Accessor<string>;
  maxDate: Accessor<string>;
} & ReturnType<typeof createDialogStore>;

const Context = createContext<ContextType>();

function ContextProvider(props: any) {
  const { state, mutate } = createDialogStore();

  const startDate = createMemo(
    () => toDate(state.event.startsAt)?.toLocaleISOString().slice(0, 10) || "",
  );

  const startTime = createMemo(
    () => toDate(state.event.startsAt)?.toLocaleISOString().slice(11, 16) || "",
  );

  const endDate = createMemo(
    () => toDate(state.event.endsAt)?.toLocaleISOString().slice(0, 10) || "",
  );

  const endTime = createMemo(
    () => toDate(state.event.endsAt)?.toLocaleISOString().slice(11, 16) || "",
  );

  const minDate = createMemo(() => {
    if (state.type === "upcoming") {
      return new Date().toLocaleISOString().slice(0, 10);
    } else {
      return "";
    }
  });

  const maxDate = createMemo(() => {
    if (state.type === "past") {
      return new Date().toLocaleISOString().slice(0, 10);
    } else {
      return "";
    }
  });

  return (
    <Context.Provider
      value={{
        state,
        mutate,
        startDate,
        startTime,
        endDate,
        endTime,
        minDate,
        maxDate,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

function useDialogContext() {
  return useContext(Context) as ContextType;
}

export default function CreateEditEvent(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditEvent ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditEvent(props: { ref: DialogRef }) {
  const {
    state,
    mutate,
    startDate,
    startTime,
    endDate,
    endTime,
    minDate,
    maxDate,
  } = useDialogContext();

  let textRef: HTMLTextAreaElement;
  let startAtDateRef: HTMLInputElement = null!;
  let startAtTimeRef: HTMLInputElement = null!;
  let endAtDateRef: HTMLInputElement = null!;
  let endAtTimeRef: HTMLInputElement = null!;

  function onBeforeShow(
    ev: CustomEvent<{ event?: Event; type?: "upcoming" | "past" }>,
  ) {
    const { event, type } = ev.detail;

    mutate((state) => {
      state.result = "Cancel";
      // Set event type
      if (type) state.type = type;
      if (event) {
        // Open in edit mode
        state.event = {
          ...event,
          // @ts-ignore
          startsAt: event.startsAt.toDate(),
          // @ts-ignore
          endsAt: event.endsAt?.toDate() || undefined,
        };
      } else {
        // Open in create mode
        state.event = {
          id: "",
          text: "",
          // @ts-ignore
          startsAt: new Date(),
          // @ts-ignore
          endsAt: null,
        };
      }
    });
  }

  function onClose(ev: CustomEvent) {
    // Prepare dialogStore for return
    mutate((state) => {
      let startsAt = new Date(
        `${startAtDateRef.value}T${startAtTimeRef.value}`,
      );
      // @ts-ignore
      if (isNaN(startsAt)) startsAt = undefined;
      let endsAt = new Date(`${endAtDateRef.value}T${endAtTimeRef.value}`);
      // @ts-ignore
      if (isNaN(endsAt)) endsAt = undefined;
      // @ts-ignore
      if (startsAt) state.event.startsAt = startsAt;
      // @ts-ignore
      if (endsAt) state.event.endsAt = endsAt;
    });

    // Resolve dialogStore as return value
    (ev.target as HTMLDialogElement).Resolve(state);
  }

  return (
    <Dialog
      id={"create-edit-event-dialog"}
      class={"create-edit-event-dialog"}
      ref={props.ref}
      onBeforeShow={onBeforeShow}
      onClose={onClose}
    >
      <Column
        class={"content"}
        classList={{ "background-past": state.type === "past" }}
      >
        <Row class={"w-full"}>
          <textarea
            ref={(el) => (textRef = el)}
            value={state.event.text}
            placeholder={"New Event..."}
            onInput={(e) => {
              mutate((state) => (state.event.text = e.currentTarget.value));
              textRef.style.height = "auto";
              textRef.style.height = textRef.scrollHeight + "px";
            }}
            class={"text"}
          />
        </Row>

        <Row class={"start-date-container"}>
          <DateInput
            ref={startAtDateRef}
            format={"DD MMM YYYY"}
            background={"transparent"}
            value={startDate()}
            min={minDate()}
            max={maxDate()}
          />
          <p> --- </p>
          <TimeInput
            ref={startAtTimeRef}
            background={"transparent"}
            value={startTime()}
          />
        </Row>

        <Row class={"end-date-container"}>
          <DateInput
            ref={endAtDateRef}
            format={"DD MMM YYYY"}
            background={"transparent"}
            value={endDate()}
            min={startDate()}
            // max={maxDate()}
          />
          <p> --- </p>
          <TimeInput
            ref={endAtTimeRef}
            background={"transparent"}
            value={endTime()}
          />
        </Row>
      </Column>

      {/*Dialog Controls*/}
      <Button
        class={"control-btn accept"}
        onClick={() => {
          mutate((state) => (state.result = "Accept"));
          const dialog = document.getElementById(
            "create-edit-event-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      >
        <Tick />
      </Button>

      <Button
        class={"control-btn cancel"}
        onClick={() => {
          mutate((state) => (state.result = "Cancel"));
          const dialog = document.getElementById(
            "create-edit-event-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      >
        <Cross />
      </Button>
    </Dialog>
  );
}
