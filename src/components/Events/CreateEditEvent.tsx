import styles from "./events.module.scss";
import { createEffect, on, onMount, Show } from "solid-js";
import { Event } from "~/api/types";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import Dialog, {
  createDialogContext,
  DialogControls,
  DialogRef,
} from "~/components/common/Dialog";
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
import DateTimePicker from "~/components/common/DateTimePicker";
import { buildDurationString, toDate } from "~/utils/DateExtensions";
import { useAppContext } from "~/AppContext";
import { detectChanges } from "~/utils/utils";

export type CreateEventDialogResult = {
  result: "Accept" | "Cancel";
  mode: "create" | "edit";
  event: Event;
  startDateTime: string;
  endDateTime: string;
};

const { ContextProvider, useDialogContext } =
  createDialogContext<CreateEventDialogResult>({
    result: "Cancel",
    mode: "create",
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
    startDateTime: "",
    endDateTime: "",
  });

export default function CreateEditEvent(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditEvent ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditEvent(props: { ref: DialogRef }) {
  const { state, mutate } = useDialogContext();
  const { Executor, API, events } = useAppContext();

  onMount(() => {
    useStartDateTimeUpdater();
    useEndDateTimeUpdater();
  });

  function onBeforeShow(ev: CustomEvent<{ event?: Event }>) {
    const event = ev.detail as Event | undefined;

    mutate((state) => {
      state.result = "Cancel";
      if (event) {
        // Open in edit mode
        state.mode = "edit";
        state.event.id = event.id;
        state.event.text = event.text;
        state.event.name = event.name;
        state.event.details = event.details;
        state.event.isPast = event.isPast;
        state.event.isSelected = false;
        // @ts-ignore
        state.event.startsAt = event.startsAt.toDate();
        // @ts-ignore
        state.event.endsAt = event.endsAt.toDate();
      } else {
        // Open in create mode
        state.mode = "create";
        state.event.id = "";
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

  async function onClose(ev: CustomEvent) {
    // Prepare dialogStore for return
    mutate((state) => {
      let startsAt = new Date(state.startDateTime);
      // @ts-ignore
      if (isNaN(startsAt)) startsAt = undefined;
      let endsAt = new Date(state.endDateTime);
      // @ts-ignore
      if (isNaN(endsAt)) endsAt = undefined;
      // @ts-ignore
      if (startsAt) state.event.startsAt = startsAt;
      // @ts-ignore
      if (endsAt) state.event.endsAt = endsAt;
    });

    // Resolve dialogStore as return value
    (ev.target as HTMLDialogElement).Resolve(state);
    if (state.result === "Cancel") return;

    switch (state.mode) {
      case "create":
        await Executor.run(
          async () => {
            if (!state.event.startsAt)
              throw new Error("Start date is required");
            await API.Events.add({ ...state.event });
          },
          {
            busyDialogMessage: "Adding event...",
          },
        );
        break;
      case "edit":
        await Executor.run(async () => {
          const original = events.entities[state.event.id];
          const changes: Partial<Event> = detectChanges(original, state.event);
          await API.Events.update({ original, changes });
        });
        break;
    }
  }

  return (
    <Dialog
      id={"create-edit-event-dialog"}
      class={styles.editDialog}
      ref={props.ref}
      onBeforeShow={onBeforeShow}
      onClose={onClose}
    >
      <Row as={"dialog-header"} class={styles.dheader}>
        Create/Edit Event
        <Img src={EventsHeaderImage} />
      </Row>
      <Column as={"edit-container"} class={styles.container}>
        <Input
          width={"full"}
          label={"Name"}
          placeholder={"... Event Name ..."}
          icon={Title}
          height={60}
          value={state.event.name}
          onInput={(ev) => {
            mutate((state) => (state.event.name = ev.currentTarget.value));
          }}
        />
        <Input
          width={"full"}
          label={"Details"}
          placeholder={"... Event details ..."}
          icon={Details}
          height={60}
          value={state.event.details}
          onInput={(ev) => {
            mutate((state) => (state.event.details = ev.currentTarget.value));
          }}
        />
        <DateTimePicker
          label={"Starts @"}
          icon={Start}
          height={60}
          value={state.startDateTime}
          onChange={(value) => {
            const newStartAtDate = new Date(value);
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

        <DateTimePicker
          label={"Ends @"}
          icon={Stop}
          height={60}
          value={state.endDateTime}
          min={state.startDateTime}
          onChange={(value) => {
            const newEndAtDate = new Date(value);
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
      </Column>
      <Preview />
      <DialogControls
        // Disabled when: name, details, startDateTime, endDateTime any one of them is empty and endDateTime is before startDateTime
        disabled={
          state.event.name === "" ||
          state.event.details === "" ||
          state.startDateTime === "" ||
          state.endDateTime === "" ||
          state.event.startsAt >= state.event.endsAt
        }
        onAccept={() => {
          mutate((state) => (state.result = "Accept"));
          const dialog = document.getElementById(
            "create-edit-event-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
        onCancel={() => {
          mutate((state) => (state.result = "Cancel"));
          const dialog = document.getElementById(
            "create-edit-event-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      />
    </Dialog>
  );
}

function useStartDateTimeUpdater() {
  const { state, mutate } = useDialogContext();

  createEffect(
    on(
      () => state.event.startsAt,
      (startsAt) => {
        mutate((state) => {
          state.startDateTime = toDate(startsAt)?.toLocaleISOString() || "";
        });
      },
    ),
  );
}

function useEndDateTimeUpdater() {
  const { state, mutate } = useDialogContext();

  createEffect(
    on(
      () => state.event.endsAt,
      (endsAt) => {
        mutate((state) => {
          state.endDateTime = toDate(endsAt)?.toLocaleISOString() || "";
        });
      },
    ),
  );
}

function Preview() {
  const { state } = useDialogContext();

  return (
    <Show when={state !== undefined}>
      <Row as={"preview"} class={styles.preview}>
        <Column
          as={"event-item"}
          class={styles.eventItem}
          classList={{
            [styles.isPast]: state.event.isPast,
          }}
        >
          <Column as={"event-header"} class={styles.header}>
            <Row as={"event-icon"} class={styles.icon}>
              <Img src={EventsHeaderImage} />
            </Row>
            <Row as={"event-name"} class={styles.name}>
              {state.event.name || "Event Name"}
            </Row>
            <Row as={"event-details"} class={styles.details}>
              {state.event.details || "Event Details"}
            </Row>
          </Column>

          <Row as={"date-time-info"} class={styles.datetimeInfo}>
            <Row as={"event-date"} class={styles.date}>
              <CalendarDate />
              <Column flex={"1"}>
                <Row>{moment(state.event.startsAt).format("DD")}</Row>
                <Row>{moment(state.event.startsAt).format("MMM")}</Row>
              </Column>
            </Row>
            <Row as={"event-time"} class={styles.time}>
              <Clock />
              <Column flex={"1"}>
                <Row>{moment(state.event.startsAt).format("HH")}</Row>
                <Row>{moment(state.event.startsAt).format("mm")}</Row>
              </Column>
            </Row>
            <Row as={"event-duration"} class={styles.duration}>
              <Duration />
              <Column flex={"1"}>
                {buildDurationString(state.event.startsAt, state.event.endsAt)}
              </Column>
            </Row>
          </Row>
        </Column>
      </Row>
    </Show>
  );
}
