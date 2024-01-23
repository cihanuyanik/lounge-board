import { Meta } from "~/api/types";
import Collection from "~/api/Collection";
import { Firestore, Timestamp } from "firebase/firestore";

export default class MetaCollection extends Collection<Meta> {
  private fixedId = "meta";
  constructor(db: Firestore) {
    super("meta", db);
  }

  async add(data: Omit<Meta, "id" | "createdAt">): Promise<void> {
    try {
      // Generate a new document id
      const dataWithId = data as Meta;
      dataWithId.id = this.fixedId;

      // Add into database
      return super.add(data);
    } catch (e) {
      throw e;
    }
  }

  async delete(): Promise<void> {
    try {
      return super.delete({
        id: this.fixedId,
        createdAt: Timestamp.now(),
        membersDisplayOrder: [],
      });
    } catch (e) {
      throw e;
    }
  }
}
