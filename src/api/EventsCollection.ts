import Collection from "~/api/Collection";
import { Event } from "~/api/types";
import { Firebase } from "~/api/Firebase";

export default class EventsCollection extends Collection<Event> {
  constructor(fb: Firebase) {
    super("events", fb);
  }

  async deleteMany(ids: string[]) {
    // Start transaction for events
    this.beginTransaction();

    // Delete events through transaction
    for (const id of ids) {
      await this.delete(id);
    }
    // Commit all transactions
    await this.commitTransaction();
  }
}
