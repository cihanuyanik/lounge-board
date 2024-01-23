import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";
import { createAdaptor, SelectableAdaptor } from "~/utils/EntityAdaptor";
import { Event } from "~/api/types";

export function createUpcomingEventStore() {
  const adaptor = createAdaptor(
    () => setEvents,
    true,
  ) as SelectableAdaptor<Event>;

  const [upcomingEvents, setEvents] = createStore({
    ...adaptor.getInitialState(),
  });

  const mutateUpcomingEvents = createMutator(setEvents);

  return { upcomingEvents, mutateUpcomingEvents };
}

export function createPastEventStore() {
  const adaptor = createAdaptor(
    () => setEvents,
    true,
  ) as SelectableAdaptor<Event>;

  const [pastEvents, setEvents] = createStore({
    ...adaptor.getInitialState(),
  });

  const mutatePastEvents = createMutator(setEvents);

  return { pastEvents, mutatePastEvents };
}
