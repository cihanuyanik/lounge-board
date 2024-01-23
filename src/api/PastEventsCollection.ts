import Collection from "~/api/Collection";
import { Firestore } from "firebase/firestore";
import { Event } from "~/api/types";

export default class PastEventsCollection extends Collection<Event> {
  constructor(db: Firestore) {
    super("past-events", db);
  }
}
