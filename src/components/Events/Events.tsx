import "./events.css";
import BlockContainer from "~/components/common/BlockContainer";
import { For, onCleanup, onMount, Show } from "solid-js";
import Scrollable from "~/components/common/Scrollable";
import { useAppContext } from "~/AppContext";
import Img from "~/components/common/Img";
import EventsHeader from "~/assets/images/events-header.png";
import { DialogResult } from "~/components/MessageBox/store";
import EventItem from "~/components/Events/EventItem";
import { Timestamp } from "firebase/firestore";
import CreateEditEvent, {
  CreateEventDialogResult,
} from "~/components/Events/CreateEditEvent";

export default function Events() {
  const { isAdmin, messageBox, busyDialog, events, API } = useAppContext();

  let eventsBlockContainer: HTMLDivElement = null!;
  let eventsScrollableContainer: HTMLDivElement = null!;
  let scrollTimer: NodeJS.Timeout;
  let activeChildIndex = -1;

  let createEventDialog: HTMLDialogElement = null!;

  let dueTimeCheckerTimer: NodeJS.Timeout;

  onMount(() => {
    if (isAdmin()) return;

    // Index page hit
    // Start scroll animation
    startScrollAnimation();

    startEventDueTimeChecker();
  });

  onCleanup(() => {
    if (isAdmin()) return;
    clearInterval(scrollTimer);
  });

  function startScrollAnimation() {
    scrollTimer = setInterval(async () => {
      // Next item
      const childElement = getActiveElement();
      if (!childElement) return;

      eventsScrollableContainer.scrollTo({
        behavior: "smooth",
        left:
          childElement.activeElem.offsetLeft +
          childElement.activeElem.offsetWidth / 2 -
          eventsScrollableContainer.offsetWidth / 2,
      });

      clearClasses(childElement.prevElem);
      clearClasses(childElement.activeElem);
      clearClasses(childElement.nextElem);

      childElement.prevElem?.classList.add("left");
      childElement.activeElem.classList.add("active");
      childElement.nextElem?.classList.add("right");
    }, 3000);
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

  function getActiveElement() {
    const childCount = eventsScrollableContainer.childElementCount;
    if (childCount === 2) {
      // No events exists
      return null;
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

  function startEventDueTimeChecker() {
    // Call time out handler after 10 minutes
    dueTimeCheckerTimer = setTimeout(timeOutHandler, 10 * 60 * 1000);

    async function timeOutHandler() {
      // Start transaction
      API.Events.beginTransaction();

      // Iterate over events and compare with current time
      // If event is due, update its isPast property
      const now = Timestamp.now();
      for (const eventId of events.ids) {
        const event = events.entities[eventId];

        // Check if event is due
        if (event.startsAt < now && event.isPast === false) {
          // Update event
          await API.Events.update({
            original: event,
            changes: { isPast: true },
          });
        }

        // Check if event is upcoming and marked as past by mistake
        if (event.startsAt > now && event.isPast === true) {
          // Update event
          await API.Events.update({
            original: event,
            changes: { isPast: false },
          });
        }
      }

      // Commit transaction
      await API.Events.commitTransaction();

      dueTimeCheckerTimer = setTimeout(timeOutHandler, 10 * 60 * 1000);
    }
  }

  async function onAddNew() {
    const dResult =
      await createEventDialog.ShowModal<CreateEventDialogResult>();
    if (dResult.result === "Cancel") return;

    try {
      if (!dResult.event.startsAt) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Start date is required");
      }

      busyDialog.show("Adding event...");
      await API.Events.add({ ...dResult.event });
      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  const onDeleteSelected = async () => {
    try {
      if (events.selectedIds.length === 0) return;

      const dResult = await messageBox.question(
        "Are you sure you want to delete event(s)?",
      );
      if (dResult === DialogResult.No) return;

      // Start transaction for upcoming events
      API.Events.beginTransaction();

      // Delete upcoming events
      for (const id of events.selectedIds) {
        await API.Events.delete(events.entities[id]);
      }
      // Commit all transactions through upcoming events
      await API.Events.commitTransaction();
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
      onAddNewItem={isAdmin() ? onAddNew : undefined}
      onDeleteSelectedItems={isAdmin() ? onDeleteSelected : undefined}
      class={"events-block-container"}
    >
      <div class={"scroll-wrapper"}>
        <Scrollable
          ref={eventsScrollableContainer}
          direction={"horizontal"}
          hideScrollbar={!isAdmin()}
          class={"events-scrollable-container"}
        >
          <Show when={!isAdmin()}>
            <div class={"event-card placeholder"} />
          </Show>

          <For each={events.ids}>
            {(id, index) => (
              <EventItem id={id} index={index} editDialog={createEventDialog} />
            )}
          </For>
          <Show when={!isAdmin()}>
            <div class={"event-card placeholder"} />
          </Show>
        </Scrollable>
      </div>
      <Show when={isAdmin()}>
        <CreateEditEvent ref={createEventDialog} />
      </Show>
    </BlockContainer>
  );
}
