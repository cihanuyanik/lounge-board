import "./events.css";
import BlockContainer from "~/components/common/BlockContainer";
import { For, onMount, Show } from "solid-js";
import Scrollable from "~/components/common/Scrollable";
import { useAppContext } from "~/AppContext";
import Img from "~/components/common/Img";
import EventsHeader from "~/assets/images/events-header.png";
import { Event } from "~/api/types";
import { DialogResult } from "~/components/MessageBox/store";
import CreateEditEvent, {
  CreateEventDialogResult,
} from "~/components/Events2/CreateEditEvent";
import EventItem from "~/components/Events2/EventItem";

export default function Events() {
  const { isAdmin, messageBox, pastEvents, upcomingEvents, API } =
    useAppContext();

  let eventsBlockContainer: HTMLDivElement = null!;
  let eventsScrollableContainer: HTMLDivElement = null!;
  let pastEventsRef: HTMLDivElement;
  let scrollTimeout: NodeJS.Timeout;
  let dueTimeCheckTimeout: NodeJS.Timeout;
  let createEventDialog: HTMLDialogElement = null!;
  let activeChildIndex = -1;

  onMount(() => {
    if (isAdmin()) return;

    setTimeout(() => {
      startScrolling();
    }, 1000);
  });

  function startScrolling() {
    function getActiveElement() {
      const childCount = eventsScrollableContainer.childElementCount;
      if (childCount === 2) {
        // No events exists
        return null;
      }

      function getPrevSibling(activeElement: HTMLElement) {
        let prevSibling = activeElement.previousElementSibling;
        while (prevSibling && prevSibling.classList.contains("placeholder")) {
          prevSibling = prevSibling.previousElementSibling;
        }
        if (!prevSibling) {
          prevSibling = eventsScrollableContainer.lastElementChild;
          while (prevSibling && prevSibling.classList.contains("placeholder")) {
            prevSibling = prevSibling.previousElementSibling;
          }
        }
        return prevSibling;
      }

      function getNextSibling(activeElement: HTMLElement) {
        let nextSibling = activeElement.nextElementSibling;
        while (nextSibling && nextSibling.classList.contains("placeholder")) {
          nextSibling = nextSibling.nextElementSibling;
        }
        if (!nextSibling) {
          nextSibling = eventsScrollableContainer.firstElementChild;
          while (nextSibling && nextSibling.classList.contains("placeholder")) {
            nextSibling = nextSibling.nextElementSibling;
          }
        }
        return nextSibling;
      }

      let searchIterationCount = 0;
      while (searchIterationCount < childCount) {
        searchIterationCount++;

        activeChildIndex = (activeChildIndex + 1) % childCount;
        const activeElement = eventsScrollableContainer.children[
          activeChildIndex
        ] as HTMLElement;
        if (!activeElement.classList.contains("placeholder")) {
          // Find previous valid sibling
          return {
            prevElem: getPrevSibling(activeElement),
            activeElem: activeElement,
            nextElem: getNextSibling(activeElement),
          };
        }
      }
    }

    function clearClasses(element: Element | null) {
      if (!element) return;
      element.classList.remove("active");
      element.classList.remove("left");
      element.classList.remove("right");
    }

    setInterval(() => {
      // Next item
      const childElement = getActiveElement();

      if (childElement) {
        childElement.activeElem.scrollIntoView({
          behavior: "smooth",
          inline: "center",
        });

        clearClasses(childElement.prevElem);
        clearClasses(childElement.activeElem);
        clearClasses(childElement.nextElem);

        childElement.prevElem?.classList.add("left");
        childElement.activeElem.classList.add("active");
        childElement.nextElem?.classList.add("right");
      }
    }, 2000);
  }

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

  const eventsIcon = <Img src={EventsHeader} style={{ height: "35px" }} />;

  return (
    <BlockContainer
      ref={eventsBlockContainer}
      title={"Events"}
      titleIcon={eventsIcon}
      onAddNewItem={isAdmin() ? () => onAddNew("past").then() : undefined}
      onDeleteSelectedItems={isAdmin() ? onDeleteSelected : undefined}
      class={"events-block-container"}
    >
      <div class={"scroll-wrapper"}>
        <Scrollable
          ref={eventsScrollableContainer}
          direction={"horizontal"}
          hideScrollbar={true}
          class={"events-scrollable-container"}
        >
          <Show when={!isAdmin()}>
            <div class={"event-item placeholder"} />
          </Show>

          <For each={pastEvents.ids}>
            {(id, index) => (
              <EventItem
                id={id}
                index={index}
                isPast={true}
                editDialog={createEventDialog}
              />
            )}
          </For>
          <Show when={!isAdmin()}>
            <div class={"event-item placeholder"} />
          </Show>
        </Scrollable>
      </div>
      <Show when={isAdmin()}>
        <CreateEditEvent ref={createEventDialog} />
      </Show>
    </BlockContainer>
  );
}
