import Collection from "~/api/Collection";
import { API } from "~/api/Firebase";
import { Member } from "~/api/types";
import { Firestore } from "firebase/firestore";

export default class MembersCollection extends Collection<Member> {
  constructor(db: Firestore) {
    super("members", db);
  }

  async add(data: Omit<Member, "id" | "createdAt">): Promise<string> {
    try {
      // Upload member image
      data.image = await API.uploadImage(`member-${data.name}`, data.image);

      return super.add(data);
    } catch (e) {
      throw e;
    }
  }

  async update(data: {
    original: Member;
    changes: Partial<Member>;
  }): Promise<void> {
    try {
      // Update member image
      if (data.changes.image && data.original.image !== data.changes.image) {
        await API.deleteImage(data.original.image);

        data.changes.image = await API.uploadImage(
          `member-${data.original.name}`,
          data.changes.image,
        );
      }

      // Update database
      return super.update(data);
    } catch (e) {
      throw e;
    }
  }

  async delete(data: Member): Promise<void> {
    // Delete member image
    if (data.image) {
      await API.deleteImage(data.image);
    }

    // Update database
    return super.delete(data);
  }
}
