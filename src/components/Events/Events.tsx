import styles from "./events.module.scss";
import BlockContainer from "~/components/common/BlockContainer";
import { For, onMount, Show } from "solid-js";
import Scrollable from "~/components/common/Scrollable";
import { useAppContext } from "~/AppContext";
import EventsHeader from "~/assets/images/events-header.png";
import { DialogResult } from "~/components/MessageBox/store";
import EventItem from "~/components/Events/EventItem";
import { Timestamp } from "firebase/firestore";
import CreateEditEvent from "~/components/Events/CreateEditEvent";
import { useTimer } from "~/utils/utils";

export default function Events() {
  const { isAdmin, messageBox, events, Executor, API } = useAppContext();

  let eventsScrollableContainer: HTMLDivElement = null!;

  let editDialog: HTMLDialogElement = null!;

  onMount(() => {
    if (isAdmin()) return;

    // Index page hit
    // Start scroll animation
    startScrollAnimation({ scrollContainer: () => eventsScrollableContainer });
    startDueTimeChecker(10 * 60 * 1000); // 10 minutes
  });

  return (
    <BlockContainer
      as={"events-block"}
      title={"Events"}
      titleIcon={EventsHeader}
      class={styles.blockContainer}
      onAddNewItem={!isAdmin() ? undefined : () => editDialog.ShowModal()}
      onDeleteSelectedItems={
        !isAdmin()
          ? undefined
          : async () => {
              if (events.selectedIds.length === 0) return;
              const dResult = await messageBox.question(
                "Are you sure you want to delete event(s)?",
              );
              if (dResult === DialogResult.No) return;

              await Executor.run(
                async () => API.Events.deleteMany(events.selectedIds),
                {
                  busyDialogMessage: "Deleting event(s)...",
                },
              );
            }
      }
    >
      {/*@ts-ignore*/}
      <scroll-wrapper class={styles.wrapper}>
        <Scrollable
          as={"scrollable"}
          ref={eventsScrollableContainer}
          direction={"horizontal"}
          hideScrollbar={!isAdmin()}
          class={styles.scrollable}
        >
          <EventItemPlaceholder visible={!isAdmin()} />

          <For each={events.ids}>
            {(id, index) => (
              <EventItem id={id} index={index} editDialog={editDialog} />
            )}
          </For>

          <EventItemPlaceholder visible={!isAdmin()} />
        </Scrollable>
        {/*@ts-ignore*/}
      </scroll-wrapper>
      <Show when={isAdmin()}>
        <CreateEditEvent ref={editDialog} />
      </Show>
    </BlockContainer>
  );
}

function EventItemPlaceholder(props: { visible: boolean }) {
  return (
    <Show when={props.visible}>
      {/*@ts-ignore*/}
      <event-item-placeholder
        classList={{
          [styles.eventItem]: true,
          [styles.placeholder]: true,
        }}
      />
    </Show>
  );
}

function startScrollAnimation(props: {
  scrollContainer: () => HTMLDivElement;
  switchInterval?: number;
}) {
  let activeChildIndex = -1;

  const timer = useTimer({
    handler: async () => {
      // Next item
      const childElement = getActiveElement();
      if (!childElement) return;

      props.scrollContainer().scrollTo({
        behavior: "smooth",
        left:
          childElement.activeElem.offsetLeft +
          childElement.activeElem.offsetWidth / 2 -
          props.scrollContainer().offsetWidth / 2,
      });

      clearClasses(childElement.prevElem);
      clearClasses(childElement.activeElem);
      clearClasses(childElement.nextElem);

      childElement.prevElem?.classList.add(styles.left);
      childElement.activeElem.classList.add(styles.active);
      childElement.nextElem?.classList.add(styles.right);
    },
    type: "interval",
    delayMs: props.switchInterval || 3000,
  });

  onMount(() => {
    timer.start();
  });

  function getPrevSibling(activeElement: HTMLElement) {
    let prevSibling = activeElement.previousElementSibling;
    while (prevSibling && prevSibling.classList.contains(styles.placeholder)) {
      prevSibling = prevSibling.previousElementSibling;
    }
    if (!prevSibling) {
      prevSibling = props.scrollContainer().lastElementChild;
      while (
        prevSibling &&
        prevSibling.classList.contains(styles.placeholder)
      ) {
        prevSibling = prevSibling.previousElementSibling;
      }
    }
    return prevSibling;
  }

  function getNextSibling(activeElement: HTMLElement) {
    let nextSibling = activeElement.nextElementSibling;
    while (nextSibling && nextSibling.classList.contains(styles.placeholder)) {
      nextSibling = nextSibling.nextElementSibling;
    }
    if (!nextSibling) {
      nextSibling = props.scrollContainer().firstElementChild;
      while (
        nextSibling &&
        nextSibling.classList.contains(styles.placeholder)
      ) {
        nextSibling = nextSibling.nextElementSibling;
      }
    }
    return nextSibling;
  }

  function getActiveElement() {
    const childCount = props.scrollContainer().childElementCount;
    if (childCount === 2) {
      // No events exists
      return null;
    }

    let searchIterationCount = 0;
    while (searchIterationCount < childCount) {
      searchIterationCount++;

      activeChildIndex = (activeChildIndex + 1) % childCount;
      const activeElement = props.scrollContainer().children[
        activeChildIndex
      ] as HTMLElement;
      if (!activeElement.classList.contains(styles.placeholder)) {
        // Find previous valid sibling
        return {
          prevElem: getPrevSibling(activeElement),
          activeElem: activeElement,
          nextElem: getNextSibling(activeElement),
        };
      }
    }

    return null;
  }

  function clearClasses(element: Element | null) {
    if (!element) return;
    element.classList.remove(styles.active);
    element.classList.remove(styles.left);
    element.classList.remove(styles.right);
  }
}

// Call time out handler after 10 minutes
function startDueTimeChecker(checkInterval: number) {
  const { events, API } = useAppContext();

  const timer = useTimer({
    handler: async () => {
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
    },
    type: "timeout",
    delayMs: checkInterval,
    repeat: true,
  });

  onMount(() => {
    timer.start();
  });
}
