import Collection from "~/api/Collection";
import { Event } from "~/api/types";
import { Firebase } from "~/api/Firebase";

export default class EventsCollection extends Collection<Event> {
  constructor(fb: Firebase) {
    super("events", fb);
  }
}
