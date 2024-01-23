import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";
import { batch } from "solid-js";
import { Adaptor, createAdaptor } from "~/utils/EntityAdaptor";
import { ResearchGroup } from "~/api/types";

export function createResearchGroupStore() {
  const adaptor = createAdaptor(
    () => setResearchGroups,
    false,
  ) as Adaptor<ResearchGroup>;

  const [researchGroups, setResearchGroups] = createStore({
    ...adaptor.getInitialState(),
    // @ts-ignore
    active: null as ResearchGroup,
    reload(researchGroups: ResearchGroup[]) {
      mutateResearchGroups((state) => {
        batch(() => {
          state.clear();
          state.add(researchGroups);
          state.next();
        });
      });
    },

    next() {
      mutateResearchGroups((state) => {
        if (state.ids.length === 0) return;

        let activeIndex = state.active
          ? state.ids.indexOf(state.active.id)
          : -1;
        activeIndex = (activeIndex + 1) % state.ids.length;
        state.active = { ...state.entities[state.ids[activeIndex]] };
      });
    },
  });

  const mutateResearchGroups = createMutator(setResearchGroups);

  return { researchGroups, mutateResearchGroups };
}
