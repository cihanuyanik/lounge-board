import Collection from "~/api/Collection";
import { Firestore } from "firebase/firestore";
import { ResearchGroup } from "~/api/types";
import { API } from "~/api/Firebase";

export default class ResearchGroupsCollection extends Collection<ResearchGroup> {
  constructor(db: Firestore) {
    super("research-groups", db);
  }

  async add(group: Omit<ResearchGroup, "id" | "createdAt">): Promise<string> {
    try {
      // Upload banner image
      if (!group.bannerImage) {
        group.bannerImage = await API.uploadImage(
          `banner-${group.name}`,
          group.bannerImage,
        );
      }

      // Upload group image
      if (!group.image) {
        group.image = await API.uploadImage(
          `research-group-${group.name}`,
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
      await API.deleteImage(data.original.bannerImage);

      data.changes.bannerImage = await API.uploadImage(
        `banner-${data.original.name}`,
        data.changes.bannerImage,
      );
    }

    // Update group image
    if (data.changes.image && data.original.image !== data.changes.image) {
      await API.deleteImage(data.original.image);
      data.changes.image = await API.uploadImage(
        `research-group-${data.original.name}`,
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
        await API.deleteImage(data.bannerImage);
      }

      // Delete group image
      if (data.image) {
        await API.deleteImage(data.image);
      }

      // Delete from database
      return super.delete(data);
    } catch (e) {
      throw e;
    }
  }
}
