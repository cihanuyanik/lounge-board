import Collection from "~/api/Collection";
import { Member } from "~/api/types";
import { Firebase } from "~/api/Firebase";

export default class MembersCollection extends Collection<Member> {
  constructor(fb: Firebase) {
    super("members", fb);
  }

  async add(data: Omit<Member, "id" | "createdAt">): Promise<string> {
    try {
      if (data.image) {
        // Upload member image
        data.image = await this._fb.uploadImage(
          `member-${data.name}`,
          data.image,
        );
      }

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
        await this._fb.deleteImage(data.original.image);

        data.changes.image = await this._fb.uploadImage(
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
      await this._fb.deleteImage(data.image);
    }

    // Update database
    return super.delete(data);
  }
}
