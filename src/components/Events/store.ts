import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";
import { createAdaptor, SelectableAdaptor } from "~/utils/EntityAdaptor";
import { Event } from "~/api/types";

export function createEventStore() {
  const adaptor = createAdaptor(
    () => setEvents,
    true,
  ) as SelectableAdaptor<Event>;

  const [events, setEvents] = createStore({
    ...adaptor.getInitialState(),
  });

  const mutateEvents = createMutator(setEvents);

  return { events, mutateEvents };
}
