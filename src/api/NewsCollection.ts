import Collection from "~/api/Collection";
import { Firestore } from "firebase/firestore";
import { New } from "~/api/types";

export default class NewsCollection extends Collection<New> {
  constructor(db: Firestore) {
    super("news", db);
  }
}
