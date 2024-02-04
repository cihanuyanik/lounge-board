import Collection from "~/api/Collection";
import { ResearchGroup } from "~/api/types";
import { Firebase } from "~/api/Firebase";

export default class ResearchGroupsCollection extends Collection<ResearchGroup> {
  constructor(fb: Firebase) {
    super("research-groups", fb);
  }

  async add(group: Omit<ResearchGroup, "id" | "createdAt">): Promise<string> {
    try {
      // Upload banner image
      if (group.bannerImage) {
        group.bannerImage = await this._fb.uploadImage(
          `banner/${group.name}`,
          group.bannerImage,
        );
      }

      // Upload group image
      if (group.image) {
        group.image = await this._fb.uploadImage(
          `research-group/${group.name}`,
          group.image,
        );
      }

      // Add into database
      return super.add(group);
    } catch (e) {
      throw e;
    }
  }

  async update(data: {
    original: ResearchGroup;
    changes: Partial<ResearchGroup>;
  }): Promise<void> {
    // Update banner image
    if (
      data.changes.bannerImage &&
      data.original.bannerImage !== data.changes.bannerImage
    ) {
      await this._fb.deleteImage(data.original.bannerImage);

      data.changes.bannerImage = await this._fb.uploadImage(
        `banner/${data.original.name}`,
        data.changes.bannerImage,
      );
    }

    // Update group image
    if (data.changes.image && data.original.image !== data.changes.image) {
      await this._fb.deleteImage(data.original.image);
      data.changes.image = await this._fb.uploadImage(
        `research-group/${data.original.name}`,
        data.changes.image,
      );
    }

    // Update database
    return super.update(data);
  }

  async delete(data: ResearchGroup): Promise<void> {
    try {
      // Delete banner image
      if (data.bannerImage) {
        await this._fb.deleteImage(data.bannerImage);
      }

      // Delete group image
      if (data.image) {
        await this._fb.deleteImage(data.image);
      }

      // Delete from database
      return super.delete(data);
    } catch (e) {
      throw e;
    }
  }
}
