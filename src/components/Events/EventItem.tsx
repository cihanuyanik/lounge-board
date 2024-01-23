import "./events.scss";
import { CreateEventDialogResult } from "~/components/Events/CreateEditEvent";
import { createMemo, Show } from "solid-js";
import DateInput from "~/components/common/DateInput";
import TimeInput from "~/components/common/TimeInput";
import { toDate } from "~/utils/utils";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import { Event } from "~/api/types";
import { API } from "~/api/Firebase";

type Props = {
  id: string;
  isPast: boolean;
  editDialog?: HTMLDialogElement;
};

export default function EventItem(props: Props) {
  const { isAdmin, pastEvents, upcomingEvents, messageBox } = useAppContext();

  const startDate = createMemo(() => {
    const startsAt = props.isPast
      ? pastEvents.entities[props.id].startsAt
      : upcomingEvents.entities[props.id].startsAt;

    return toDate(startsAt)?.toLocaleISOString().slice(0, 10) || "";
  });

  const startTime = createMemo(() => {
    const startsAt = props.isPast
      ? pastEvents.entities[props.id].startsAt
      : upcomingEvents.entities[props.id].startsAt;

    return toDate(startsAt)?.toLocaleISOString().slice(11, 16) || "";
  });

  const endDate = createMemo(() => {
    const endsAt = props.isPast
      ? pastEvents.entities[props.id].endsAt
      : upcomingEvents.entities[props.id].endsAt;

    let eDate = toDate(endsAt)?.toLocaleISOString().slice(0, 10) || "";

    if (startDate() === eDate) {
      eDate = "";
    }

    return eDate;
  });

  const endTime = createMemo(() => {
    const endsAt = props.isPast
      ? pastEvents.entities[props.id].endsAt
      : upcomingEvents.entities[props.id].endsAt;

    return toDate(endsAt)?.toLocaleISOString().slice(11, 16) || "";
  });

  function onClick() {
    const events = props.isPast ? pastEvents : upcomingEvents;
    if (events.entities[props.id].isSelected) events.unselect(props.id);
    else events.select(props.id);
  }

  async function onDoubleClick() {
    if (!props.editDialog) return;
    const original = props.isPast
      ? pastEvents.entities[props.id]
      : upcomingEvents.entities[props.id];

    const dResult = await props.editDialog.ShowModal<CreateEventDialogResult>({
      event: original,
      type: props.isPast ? "past" : "upcoming",
    });

    if (dResult.result === "Cancel") return;

    try {
      if (!dResult.event.startsAt) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Start date is required");
      }

      const changes: Event = {
        id: original.id,
        createdAt: original.createdAt,
        text: dResult.event.text,
        startsAt: dResult.event.startsAt,
        endsAt: dResult.event.endsAt ? dResult.event.endsAt : null,
        isSelected: false,
      };

      if (!new Date().isLessThan(changes.startsAt!)) {
        // if startsAt smaller than current date, then it is a past event
        if (!props.isPast) {
          // if it is marked as upcoming event by props, it should be deleted from upcoming events
          await API.UpcomingEvents.delete(original);
        }

        // then put it into past events
        await API.PastEvents.add(changes);
      } else {
        // At this point it is going to be upcoming event
        if (props.isPast) {
          // if it is marked as past event by props, it should be deleted from past events
          await API.PastEvents.delete(original);
        }

        // then put it into upcoming events
        await API.UpcomingEvents.add(changes);
      }
    } catch (e) {
      messageBox.error(`${e}`);
    }
  }

  return (
    <Column
      class={"event-item"}
      classList={{
        "past-event-item-background": props.isPast,
        "item-selected":
          pastEvents.entities[props.id]?.isSelected ||
          upcomingEvents.entities[props.id]?.isSelected,
        "cursor-pointer": isAdmin(),
      }}
      onclick={isAdmin() ? onClick : undefined}
      ondblclick={isAdmin() ? onDoubleClick : undefined}
    >
      <Row class={"text"}>
        <Show when={props.isPast}>{pastEvents.entities[props.id].text}</Show>
        <Show when={!props.isPast}>
          {upcomingEvents.entities[props.id].text}
        </Show>
      </Row>
      <Row class={"time"}>
        <DateInput
          value={startDate()}
          format={"DD MMM YYYY"}
          background={"transparent"}
          disabled={true}
        />

        <Show when={startTime()}>
          <p> --- </p>
          <TimeInput
            value={startTime()}
            background={"transparent"}
            disabled={true}
          />
        </Show>

        <Show when={endDate() === "" && endTime()}>
          <p> - </p>
          <p>{endTime()}</p>
        </Show>
      </Row>

      <Show when={endDate()}>
        <Row class={"time"}>
          <DateInput
            value={endDate()}
            format={"DD MMM YYYY"}
            background={"transparent"}
            disabled={true}
          />

          <Show when={endTime()}>
            <p> --- </p>
            <TimeInput
              value={endTime()}
              background={"transparent"}
              disabled={true}
            />
          </Show>
        </Row>
      </Show>
    </Column>
  );
}
