import "./events.scss";
import { For, onCleanup, onMount, Show } from "solid-js";
import EventItem from "~/components/Events/EventItem";
import Img from "~/components/common/Img";
import EventsHeader from "~/assets/images/events-header.png";
import CreateEditEvent, {
  CreateEventDialogResult,
} from "~/components/Events/CreateEditEvent";
import { DialogResult } from "~/components/MessageBox/store";
import { scrollBottomAnimation } from "~/utils/utils";
import Column from "~/components/common/Column";
import Scrollable from "~/components/common/Scrollable";
import BlockContainer from "~/components/common/BlockContainer";
import { useAppContext } from "~/AppContext";
import { API } from "~/api/Firebase";
import { Event } from "~/api/types";

export default function Events() {
  const { isAdmin, messageBox, pastEvents, upcomingEvents } = useAppContext();

  let upcomingEventsRef: HTMLDivElement;
  let pastEventsRef: HTMLDivElement;
  let scrollTimeout: NodeJS.Timeout;
  let dueTimeCheckTimeout: NodeJS.Timeout;
  let createEventDialog: HTMLDialogElement = null!;

  async function scrollAnimate() {
    await Promise.all([
      scrollBottomAnimation(upcomingEventsRef, 1000),
      scrollBottomAnimation(pastEventsRef, 1000),
    ]);

    scrollTimeout = setTimeout(scrollAnimate, 5000);
  }

  async function dueTimeCheckTimeoutHandler() {
    const nowDate = new Date();
    // Go through all upcoming events and check if they are due
    for (const id of upcomingEvents.ids) {
      if (!nowDate.isLessThan(upcomingEvents.entities[id].startsAt)) {
        // remove from upcoming events
        await API.UpcomingEvents.delete(upcomingEvents.entities[id]);
        // add to past events
        await API.PastEvents.add(upcomingEvents.entities[id]);
      }
    }

    dueTimeCheckTimeout = setTimeout(dueTimeCheckTimeoutHandler, 60000);
  }

  onMount(() => {
    if (isAdmin()) return;
    scrollTimeout = setTimeout(scrollAnimate, 5000);
    dueTimeCheckTimeout = setTimeout(dueTimeCheckTimeoutHandler, 60000);
  });

  onCleanup(() => {
    clearTimeout(scrollTimeout);
    clearTimeout(dueTimeCheckTimeout);
  });

  const onAddNew = async (type: "upcoming" | "past") => {
    const dResult = await createEventDialog.ShowModal<CreateEventDialogResult>({
      type,
    });
    if (dResult.result === "Cancel") return;

    try {
      if (!dResult.event.startsAt) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Start date is required");
      }

      const newEvent: Omit<Event, "id" | "createdAt"> = {
        text: dResult.event.text,
        startsAt: dResult.event.startsAt,
        endsAt: dResult.event.endsAt ? dResult.event.endsAt : null,
        isSelected: false,
      };

      // if startsAt smaller than current date, then it is a past event
      if (!new Date().isLessThan(dResult.event.startsAt)) {
        // past event
        await API.PastEvents.add(newEvent);
      } else {
        // upcoming event
        await API.UpcomingEvents.add(newEvent);
      }
    } catch (e) {
      messageBox.error(`${e}`);
    }
  };

  const onDeleteSelected = async () => {
    try {
      if (
        upcomingEvents.selectedIds.length === 0 &&
        pastEvents.selectedIds.length === 0
      )
        return;

      const dResult = await messageBox.question(
        "Are you sure you want to delete event(s)?",
      );
      if (dResult === DialogResult.No) return;

      // Start transaction for upcoming events
      API.UpcomingEvents.beginTransaction();

      // Delete upcoming events
      for (const id of upcomingEvents.selectedIds) {
        await API.UpcomingEvents.delete(upcomingEvents.entities[id]);
      }

      // Start transaction for past events by using existing batch
      API.PastEvents.batch = API.UpcomingEvents.batch;

      // Delete past events
      for (const id of pastEvents.selectedIds) {
        await API.PastEvents.delete(pastEvents.entities[id]);
      }

      // Commit all transactions through upcoming events
      await API.UpcomingEvents.commitTransaction();

      // Clear transaction in past events
      API.PastEvents.batch = undefined;
    } catch (e) {
      messageBox.error(`${e}`);
    }
  };

  const ucEventsIcon = <Img src={EventsHeader} style={{ height: "35px" }} />;

  const pastEventsIcon = <Img src={EventsHeader} style={{ height: "35px" }} />;

  return (
    <Column class={"events-container"}>
      <BlockContainer
        title={"Upcoming Events"}
        titleIcon={ucEventsIcon}
        onAddNewItem={isAdmin() ? () => onAddNew("upcoming").then() : undefined}
        onDeleteSelectedItems={isAdmin() ? onDeleteSelected : undefined}
        class={"w-full flex-1-0-0"}
      >
        <Scrollable
          ref={(el) => (upcomingEventsRef = el)}
          direction={"vertical"}
          hideScrollbar={true}
          class={"upcoming-events-container"}
        >
          <For each={upcomingEvents.ids}>
            {(id) => (
              <EventItem
                id={id}
                isPast={false}
                editDialog={createEventDialog}
              />
            )}
          </For>
        </Scrollable>
      </BlockContainer>

      <BlockContainer
        title={"Past Events"}
        titleIcon={pastEventsIcon}
        onAddNewItem={isAdmin() ? () => onAddNew("past").then() : undefined}
        onDeleteSelectedItems={isAdmin() ? onDeleteSelected : undefined}
        class={"w-full flex-1-0-0"}
      >
        <Scrollable
          ref={(el) => (pastEventsRef = el)}
          direction={"vertical"}
          hideScrollbar={true}
          class={"past-events-container"}
        >
          <For each={pastEvents.ids}>
            {(id) => (
              <EventItem id={id} isPast={true} editDialog={createEventDialog} />
            )}
          </For>
        </Scrollable>
      </BlockContainer>
      <Show when={isAdmin()}>
        <CreateEditEvent ref={createEventDialog} />
      </Show>
    </Column>
  );
}
