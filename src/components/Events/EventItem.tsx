import { Accessor } from "solid-js";
import { buildDurationString, toDate } from "~/utils/utils";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import { Event } from "~/api/types";
import { CreateEventDialogResult } from "~/components/Events/CreateEditEvent";
import Img from "~/components/common/Img";
import EventsHeaderImage from "~/assets/images/events-header.png";
import CalendarDate from "~/assets/icons/CalendarDate";
import moment from "moment/moment";
import Clock from "~/assets/icons/Clock";
import Duration from "~/assets/icons/Duration";

type Props = {
  id: string;
  index: Accessor<number>;
  editDialog?: HTMLDialogElement;
};

export default function EventItem(props: Props) {
  const { isAdmin, events, messageBox, API } = useAppContext();

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
      changes.isSelected = false;

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
      class={"event-card"}
      classList={{
        "past-event-item-background": events.entities[props.id]?.isPast,
        "item-selected": events.entities[props.id]?.isSelected,
        "cursor-pointer": isAdmin(),
        "scroll-item": !isAdmin(),
      }}
      onclick={isAdmin() ? onClick : undefined}
      ondblclick={isAdmin() ? onDoubleClick : undefined}
    >
      <Column class={"event-card-header"}>
        <Row class={"icon"}>
          <Img src={EventsHeaderImage} />
        </Row>
        <Row class={"name"}>
          {events.entities[props.id].name || "Event Name"}
        </Row>
        <Row class={"horizontal-line"}></Row>
        <Row class={"details"}>
          {events.entities[props.id].details || "Event Details"}
        </Row>
      </Column>

      <Row class={"event-card-datetime-info"}>
        <Row class={"date"}>
          <CalendarDate />
          <Column class={"flex-1"}>
            <Row>
              {moment(events.entities[props.id].startsAt.toDate()).format("DD")}
            </Row>
            <Row>
              {moment(events.entities[props.id].startsAt.toDate()).format(
                "MMM",
              )}
            </Row>
          </Column>
        </Row>
        <Row class={"time"}>
          <Clock />
          <Column class={"flex-1"}>
            <Row>
              {moment(events.entities[props.id].startsAt.toDate()).format("HH")}
            </Row>
            <Row>
              {moment(events.entities[props.id].startsAt.toDate()).format("mm")}
            </Row>
          </Column>
        </Row>
        <Row class={"duration"}>
          <Duration />
          <Column class={"flex-1"}>
            {buildDurationString(
              toDate(events.entities[props.id].startsAt),
              toDate(events.entities[props.id].endsAt),
            )}
          </Column>
        </Row>
      </Row>
    </Column>
  );
}
