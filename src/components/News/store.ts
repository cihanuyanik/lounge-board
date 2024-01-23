import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";
import { createAdaptor, SelectableAdaptor } from "~/utils/EntityAdaptor";
import { New } from "~/api/types";

export function createNewsStore() {
  const adaptor = createAdaptor(() => setNews, true) as SelectableAdaptor<New>;
  const [news, setNews] = createStore(adaptor.getInitialState());
  const mutateNews = createMutator(setNews);

  return { news, mutateNews };
}
