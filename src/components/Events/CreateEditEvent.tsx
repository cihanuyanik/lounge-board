import "./events.css";
import Button from "~/components/common/Button";
import { createStore } from "solid-js/store";
import {
  Accessor,
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  useContext,
} from "solid-js";
import { Event } from "~/api/types";
import { createMutator, toDate } from "~/utils/utils";
import DateInput from "~/components/common/DateInput";
import TimeInput from "~/components/common/TimeInput";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import moment from "moment";

export type CreateEventDialogResult = {
  result: "Accept" | "Cancel";
  event: Event;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

function createDialogStore() {
  const [state, setState] = createStore<CreateEventDialogResult>({
    result: "Cancel",
    event: {
      id: "",
      text: "",
      isPast: false,
      isSelected: false,
      // @ts-ignore
      startsAt: new Date(),
      // @ts-ignore
      endsAt: null,
    },
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const mutate = createMutator(setState);

  createEffect(
    on(
      () => state.event.startsAt,
      (startsAt) => {
        mutate((state) => {
          state.startDate =
            toDate(startsAt)?.toLocaleISOString().slice(0, 10) || "";
          state.startTime =
            toDate(startsAt)?.toLocaleISOString().slice(11, 16) || "";
        });
      },
    ),
  );

  createEffect(
    on(
      () => state.event.endsAt,
      (endsAt) => {
        mutate((state) => {
          state.endDate =
            toDate(endsAt)?.toLocaleISOString().slice(0, 10) || "";
          state.endTime =
            toDate(endsAt)?.toLocaleISOString().slice(11, 16) || "";
        });
      },
    ),
  );

  return { state, mutate };
}

type ContextType = ReturnType<typeof createDialogStore>;

const Context = createContext<ContextType>();

function ContextProvider(props: any) {
  const { state, mutate } = createDialogStore();

  return (
    <Context.Provider
      value={{
        state,
        mutate,
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
  const { state, mutate } = useDialogContext();

  let textRef: HTMLTextAreaElement;
  let startAtDateRef: HTMLInputElement = null!;
  let startAtTimeRef: HTMLInputElement = null!;
  let endAtDateRef: HTMLInputElement = null!;
  let endAtTimeRef: HTMLInputElement = null!;

  function onBeforeShow(
    ev: CustomEvent<{ event?: Event; type?: "upcoming" | "past" }>,
  ) {
    const event = ev.detail as Event | undefined;

    mutate((state) => {
      state.result = "Cancel";
      if (event) {
        // Open in edit mode
        state.event.id = event.id;
        state.event.text = event.text;
        state.event.isPast = event.isPast;
        state.event.isSelected = event.isSelected;
        // @ts-ignore
        state.event.startsAt = event.startsAt.toDate();
        // @ts-ignore
        state.event.endsAt = event.endsAt?.toDate() || undefined;
      } else {
        // Open in create mode
        // 1 week from this day at 09:00
        const startsAt = new Date(moment().add(1, "week").toDate());
        startsAt.setHours(9, 0);

        state.event.text = "";
        state.event.isPast = false;
        state.event.isSelected = false;
        // @ts-ignore
        state.event.startsAt = startsAt;
        // @ts-ignore
        state.event.endsAt = null;
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
        classList={{ "background-past": state.event.isPast }}
      >
        <Row class={"w-full flex-1"}>
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
            value={state.startDate}
            onChange={(value) => {
              const newStartAtDate = new Date(
                value + "T" + startAtTimeRef.value,
              );
              // Check whether the date is valid
              if (isNaN(newStartAtDate.getTime())) {
                return;
              }

              mutate((state) => {
                // Check whether the date is in the past
                state.event.isPast = newStartAtDate < new Date();
                // Update startsAt
                // @ts-ignore
                state.event.startsAt = newStartAtDate;
              });
            }}
          />
          <p> --- </p>
          <TimeInput
            ref={startAtTimeRef}
            background={"transparent"}
            value={state.startTime}
            onChange={(value) => {
              const newStartAtDate = new Date(
                startAtDateRef.value + "T" + value,
              );
              // Check whether the date is valid
              if (isNaN(newStartAtDate.getTime())) {
                return;
              }

              mutate((state) => {
                // Check whether the date is in the past
                state.event.isPast = newStartAtDate < new Date();
                // Update startsAt
                // @ts-ignore
                state.event.startsAt = newStartAtDate;
              });
            }}
          />
        </Row>

        <Row class={"end-date-container"}>
          <DateInput
            ref={endAtDateRef}
            format={"DD MMM YYYY"}
            background={"transparent"}
            value={state.endDate}
            min={state.startDate}
            onChange={(value) => {
              const newEndAtDate = new Date(value + "T" + endAtTimeRef.value);
              // Check whether the date is valid
              if (isNaN(newEndAtDate.getTime())) {
                return;
              }

              mutate((state) => {
                // Update endsAt
                // @ts-ignore
                state.event.endsAt = newEndAtDate;
              });
            }}
          />
          <p> --- </p>
          <TimeInput
            ref={endAtTimeRef}
            background={"transparent"}
            value={state.endTime}
            onChange={(value) => {
              const newEndAtDate = new Date(endAtDateRef.value + "T" + value);
              // Check whether the date is valid
              if (isNaN(newEndAtDate.getTime())) {
                return;
              }

              mutate((state) => {
                // Update endsAt
                // @ts-ignore
                state.event.endsAt = newEndAtDate;
              });
            }}
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
