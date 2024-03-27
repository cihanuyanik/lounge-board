import styles from "./events.module.scss";
import { Accessor } from "solid-js";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import { useAppContext } from "~/AppContext";
import Img from "~/components/common/Img";
import EventsHeaderImage from "~/assets/images/events-header.png";
import CalendarDate from "~/assets/icons/CalendarDate";
import moment from "moment/moment";
import Clock from "~/assets/icons/Clock";
import Duration from "~/assets/icons/Duration";
import { buildDurationString } from "~/utils/DateExtensions";
import SelectedMarker from "~/components/SelectedMarker";

type Props = {
  id: string;
  index: Accessor<number>;
  editDialog: HTMLDialogElement;
};

export default function EventItem(props: Props) {
  const { isAdmin, events } = useAppContext();

  return (
    <Column
      class={styles.eventItem}
      classList={{
        [styles.isPast]: events.entities[props.id]?.isPast,
        [styles.selected]: events.entities[props.id]?.isSelected,
        [styles.pointer]: isAdmin(),
        [styles.scrollItem]: !isAdmin(),
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
      <Column class={styles.header}>
        <Row class={styles.icon}>
          <Img src={EventsHeaderImage} />
        </Row>
        <Row class={styles.name}>
          {events.entities[props.id].name || "Event Name"}
        </Row>
        <Row class={styles.details}>
          {events.entities[props.id].details || "Event Details"}
        </Row>
      </Column>

      <Row class={styles.datetimeInfo}>
        <Row class={styles.date}>
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
        <Row class={styles.time}>
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
        <Row class={styles.duration}>
          <Duration />
          <Column class={"flex-1"}>
            {buildDurationString(
              events.entities[props.id].startsAt,
              events.entities[props.id].endsAt,
            )}
          </Column>
        </Row>
      </Row>
      <SelectedMarker
        visible={isAdmin() && events.entities[props.id]?.isSelected}
      />
    </Column>
  );
}
