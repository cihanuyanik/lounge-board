import "./events.css";
import Button from "~/components/common/Button";
import { createStore } from "solid-js/store";
import { createContext, createEffect, on, useContext } from "solid-js";
import { Event } from "~/api/types";
import { buildDurationString, createMutator, toDate } from "~/utils/utils";
import DateInput from "~/components/common/DateInput";
import TimeInput, { TimeInputRef } from "~/components/common/TimeInput/index";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import moment from "moment";
import Img from "~/components/common/Img";
import EventsHeaderImage from "~/assets/images/events-header.png";
import Input from "~/components/common/Input";
import CalendarDate from "~/assets/icons/CalendarDate";
import Clock from "~/assets/icons/Clock";
import Duration from "~/assets/icons/Duration";
import Title from "~/assets/icons/Title";
import Details from "~/assets/icons/Details";
import Start from "~/assets/icons/Start";
import Stop from "~/assets/icons/Stop";

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
      name: "",
      details: "",
      isPast: false,
      isSelected: false,
      // @ts-ignore
      startsAt: new Date(),
      // @ts-ignore
      endsAt: new Date(),
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

  let startAtDateRef: HTMLInputElement = null!;
  let startAtTimeRef: TimeInputRef = null!;
  let endAtDateRef: HTMLInputElement = null!;
  let endAtTimeRef: TimeInputRef = null!;

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
        state.event.name = event.name;
        state.event.details = event.details;
        state.event.isPast = event.isPast;
        state.event.isSelected = event.isSelected;
        // @ts-ignore
        state.event.startsAt = event.startsAt.toDate();
        // @ts-ignore
        state.event.endsAt = event.endsAt.toDate();
      } else {
        // Open in create mode

        state.event.text = "";
        state.event.name = "";
        state.event.details = "";
        state.event.isPast = false;
        state.event.isSelected = false;

        // 1 week from this day at 09:00
        const startsAt = new Date(moment().add(1, "week").toDate());
        startsAt.setHours(9, 0);
        // @ts-ignore
        state.event.startsAt = startsAt;

        // 1 week from this day at 10:00
        const endsAt = new Date(moment().add(1, "week").toDate());
        endsAt.setHours(10, 0);
        // @ts-ignore
        state.event.endsAt = endsAt;
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
      <Row class={"header"}>
        Create/Edit Event
        <Img src={EventsHeaderImage} />
      </Row>
      <Column class={"content-editors"}>
        <Input
          label={"Name"}
          placeholder={"... Event Name ..."}
          class={"w-full"}
          icon={Title}
          height={60}
          value={state.event.name}
          onInput={(ev) => {
            mutate((state) => (state.event.name = ev.currentTarget.value));
          }}
        />
        <Input
          label={"Details"}
          placeholder={"... Event details ..."}
          class={"w-full"}
          icon={Details}
          height={60}
          value={state.event.details}
          onInput={(ev) => {
            mutate((state) => (state.event.details = ev.currentTarget.value));
          }}
        />
        <Column class={"date-time-picker"}>
          <Start />
          <label>Starts @</label>
          <Row class={"date-time-container"}>
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
            <p>-</p>
            <TimeInput
              ref={startAtTimeRef}
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
        </Column>

        <Column class={"date-time-picker"}>
          <Stop />
          <label>Ends @</label>
          <Row class={"date-time-container"}>
            <DateInput
              ref={endAtDateRef}
              format={"DD MMM YYYY"}
              background={"transparent"}
              value={state.endDate || state.startDate}
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
            <p>-</p>
            <TimeInput
              ref={endAtTimeRef}
              value={state.endTime || state.startTime}
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
      </Column>
      <Row class={"separator"} />
      <Preview />

      {/*Dialog Controls*/}
      <>
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
      </>
    </Dialog>
  );
}

function Preview() {
  const { state } = useDialogContext();

  return (
    <Row class={"preview"}>
      <Column
        class={"event-card"}
        classList={{
          "past-event-item-background": state.event.isPast,
        }}
      >
        <Column class={"event-card-header"}>
          <Row class={"icon"}>
            <Img src={EventsHeaderImage} />
          </Row>
          <Row class={"name"}>{state.event.name || "Event Name"}</Row>
          <Row class={"horizontal-line"}></Row>
          <Row class={"details"}>{state.event.details || "Event Details"}</Row>
        </Column>

        <Row class={"event-card-datetime-info"}>
          <Row class={"date"}>
            <CalendarDate />
            <Column class={"flex-1"}>
              <Row>{moment(state.event.startsAt).format("DD")}</Row>
              <Row>{moment(state.event.startsAt).format("MMM")}</Row>
            </Column>
          </Row>
          <Row class={"time"}>
            <Clock />
            <Column class={"flex-1"}>
              <Row>{moment(state.event.startsAt).format("HH")}</Row>
              <Row>{moment(state.event.startsAt).format("mm")}</Row>
            </Column>
          </Row>
          <Row class={"duration"}>
            <Duration />
            <Column class={"flex-1"}>
              {buildDurationString(
                toDate(state.event.startsAt),
                toDate(state.event.endsAt),
              )}
            </Column>
          </Row>
        </Row>
      </Column>
    </Row>
  );
}
