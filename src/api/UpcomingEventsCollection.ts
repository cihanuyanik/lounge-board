import Collection from "~/api/Collection";
import { Firestore } from "firebase/firestore";
import { Event } from "~/api/types";

export default class UpcomingEventsCollection extends Collection<Event> {
  constructor(db: Firestore) {
    super("upcoming-events", db);
  }
}
