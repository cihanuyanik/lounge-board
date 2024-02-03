import { createStore } from "solid-js/store";
import { createMutator } from "~/utils/utils";
import { createAdaptor, SelectableAdaptor } from "~/utils/EntityAdaptor";
import { Member } from "~/api/types";

export function createMemberStore() {
  const adaptor = createAdaptor(
    () => setMembers,
    true,
  ) as SelectableAdaptor<Member>;

  const [members, setMembers] = createStore({
    ...adaptor.getInitialState(),
  });

  const mutateMembers = createMutator(setMembers);

  return { members, mutateMembers };
}
