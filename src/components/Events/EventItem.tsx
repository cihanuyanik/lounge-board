import { Accessor, Show } from "solid-js";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import Img from "~/components/common/Img";
import EventsHeaderImage from "~/assets/images/events-header.png";
import CalendarDate from "~/assets/icons/CalendarDate";
import moment from "moment/moment";
import Clock from "~/assets/icons/Clock";
import Duration from "~/assets/icons/Duration";
import Tick from "~/assets/icons/Tick";
import { buildDurationString } from "~/utils/DateExtensions";

type Props = {
  id: string;
  index: Accessor<number>;
  editDialog: HTMLDialogElement;
};

export default function EventItem(props: Props) {
  const { isAdmin, events } = useAppContext();

  return (
    <Column
      class={"event-card"}
      classList={{
        "past-event-item-background": events.entities[props.id]?.isPast,
        "item-selected": events.entities[props.id]?.isSelected,
        "cursor-pointer": isAdmin(),
        "scroll-item": !isAdmin(),
      }}
      onclick={
        !isAdmin()
          ? undefined
          : () => {
              if (events.entities[props.id].isSelected)
                events.unselect(props.id);
              else events.select(props.id);
            }
      }
      ondblclick={
        !isAdmin()
          ? undefined
          : () => props.editDialog.ShowModal(events.entities[props.id])
      }
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
              events.entities[props.id].startsAt,
              events.entities[props.id].endsAt,
            )}
          </Column>
        </Row>
      </Row>
      <Show when={isAdmin() && events.entities[props.id]?.isSelected}>
        <Row class={"item-selected-marker"}>
          <Tick />
        </Row>
      </Show>
    </Column>
  );
}
