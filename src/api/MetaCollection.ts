import { Meta } from "~/api/types";
import Collection from "~/api/Collection";
import { Timestamp } from "firebase/firestore";
import { Firebase } from "~/api/Firebase";

export default class MetaCollection extends Collection<Meta> {
  private fixedId = "meta";
  constructor(fb: Firebase) {
    super("meta", fb);
  }

  async add(data: Omit<Meta, "id" | "createdAt">): Promise<string> {
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

  async update(data: {
    original: Meta;
    changes: Partial<Meta>;
  }): Promise<void> {
    // Update database
    const meta = {
      ...data.original,
      ...data.changes,
    };

    await super.add(meta);

    // return super.update(data);
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
