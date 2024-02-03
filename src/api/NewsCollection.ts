import Collection from "~/api/Collection";
import { New } from "~/api/types";
import { Firebase } from "~/api/Firebase";

export default class NewsCollection extends Collection<New> {
  constructor(fb: Firebase) {
    super("news", fb);
  }

  async deleteMany(ids: string[]) {
    this.beginTransaction();
    for (const id of ids) {
      await this.delete(id);
    }
    await this.commitTransaction();
  }
}
