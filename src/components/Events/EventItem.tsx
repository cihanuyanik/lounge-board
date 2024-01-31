import { Accessor, createMemo, Show } from "solid-js";
import DateInput from "~/components/common/DateInput";
import TimeInput from "~/components/common/TimeInput";
import { toDate } from "~/utils/utils";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import { Event } from "~/api/types";
import { CreateEventDialogResult } from "~/components/Events/CreateEditEvent";

type Props = {
  id: string;
  index: Accessor<number>;
  editDialog?: HTMLDialogElement;
};

export default function EventItem(props: Props) {
  const { isAdmin, events, messageBox, API } = useAppContext();

  const startDate = createMemo(() => {
    return (
      toDate(events.entities[props.id].startsAt)
        ?.toLocaleISOString()
        .slice(0, 10) || ""
    );
  });

  const startTime = createMemo(() => {
    return (
      toDate(events.entities[props.id].startsAt)
        ?.toLocaleISOString()
        .slice(11, 16) || ""
    );
  });

  const endDate = createMemo(() => {
    let eDate =
      toDate(events.entities[props.id].endsAt)
        ?.toLocaleISOString()
        .slice(0, 10) || "";

    if (startDate() === eDate) {
      eDate = "";
    }

    return eDate;
  });

  const endTime = createMemo(() => {
    return (
      toDate(events.entities[props.id].endsAt)
        ?.toLocaleISOString()
        .slice(11, 16) || ""
    );
  });

  function onClick() {
    if (events.entities[props.id].isSelected) events.unselect(props.id);
    else events.select(props.id);
  }

  async function onDoubleClick() {
    if (!props.editDialog) return;

    const dResult = await props.editDialog.ShowModal<CreateEventDialogResult>(
      events.entities[props.id],
    );

    if (dResult.result === "Cancel") return;

    try {
      if (!dResult.event.startsAt) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Start date is required");
      }

      const original = events.entities[props.id];
      const changes: Partial<Event> = {};
      if (original.text !== dResult.event.text) {
        changes.text = dResult.event.text;
      }
      if (original.startsAt !== dResult.event.startsAt) {
        changes.startsAt = dResult.event.startsAt;
      }
      if (original.endsAt !== dResult.event.endsAt) {
        changes.endsAt = dResult.event.endsAt;
      }
      if (original.isPast !== dResult.event.isPast) {
        changes.isPast = dResult.event.isPast;
      }

      await API.Events.update({
        original: events.entities[props.id],
        changes: changes,
      });
    } catch (e) {
      messageBox.error(`${e}`);
    }
  }

  return (
    <Column
      class={"event-item"}
      classList={{
        "past-event-item-background": events.entities[props.id]?.isPast,
        "item-selected": events.entities[props.id]?.isSelected,
        "cursor-pointer": isAdmin(),
        // emphasize: !props.isPast && props.index() === 0,
        "scroll-item": !isAdmin(),
      }}
      onclick={isAdmin() ? onClick : undefined}
      ondblclick={isAdmin() ? onDoubleClick : undefined}
    >
      <Row class={"text"}>{events.entities[props.id].text}</Row>
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
