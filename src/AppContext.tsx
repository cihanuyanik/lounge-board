import {
  Accessor,
  createContext,
  createMemo,
  createSignal,
  Setter,
  useContext,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import {
  createPastEventStore,
  createUpcomingEventStore,
} from "~/components/Events/store";
import { createNewsStore } from "~/components/News/store";
import { createResearchGroupStore } from "~/components/ResearchGroups/store";
import { createMemberStore } from "~/components/Members/store";
import { createBusyDialogStore } from "~/components/BusyDialog/store";
import { createMessageBoxStore } from "~/components/MessageBox/store";
import { createStore } from "solid-js/store";
import { Meta, User } from "~/api/types";
import { createMutator } from "~/utils/utils";
import { Firebase } from "~/api/Firebase";

type AppContextType = {
  isAdmin: Accessor<boolean>;
  user: Accessor<User>;
  setUser: Setter<User>;
  API: Firebase;
} & ReturnType<typeof createPastEventStore> &
  ReturnType<typeof createUpcomingEventStore> &
  ReturnType<typeof createNewsStore> &
  ReturnType<typeof createResearchGroupStore> &
  ReturnType<typeof createMemberStore> &
  ReturnType<typeof createMetaStore> &
  ReturnType<typeof createBusyDialogStore> &
  ReturnType<typeof createMessageBoxStore>;

export function createMetaStore() {
  const [meta, setMeta] = createStore<Meta>({
    id: "meta",
    membersDisplayOrder: [],
    // @ts-ignore
    createdAt: undefined,
  });

  const mutateMeta = createMutator(setMeta);

  return { meta, mutateMeta };
}

// Create context
export const AppContext = createContext<AppContextType>();

// Create provider and fill with data
export function AppContextProvider(props: any) {
  const isAdmin = createMemo<boolean>(() => {
    const url = useLocation();
    return url.pathname.startsWith("/admin");
  });

  const { busyDialog, mutateBusyDialog } = createBusyDialogStore();

  const { messageBox, mutateMessageBox } = createMessageBoxStore();

  const { pastEvents, mutatePastEvents } = createPastEventStore();

  const { upcomingEvents, mutateUpcomingEvents } = createUpcomingEventStore();

  const { news, mutateNews } = createNewsStore();

  const { researchGroups, mutateResearchGroups } = createResearchGroupStore();

  const { members, mutateMembers } = createMemberStore();

  const { meta, mutateMeta } = createMetaStore();

  const [user, setUser] = createSignal<User>(null!);

  const API = new Firebase();

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        pastEvents,
        mutatePastEvents,
        upcomingEvents,
        mutateUpcomingEvents,
        news,
        mutateNews,
        researchGroups,
        mutateResearchGroups,
        members,
        mutateMembers,
        meta,
        mutateMeta,
        busyDialog,
        mutateBusyDialog,
        messageBox,
        mutateMessageBox,
        user,
        setUser,
        API,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

// Create hook to use context
export function useAppContext() {
  return useContext(AppContext) as AppContextType;
}

export function useDataLoader() {
  const {
    busyDialog,
    messageBox,
    pastEvents,
    upcomingEvents,
    news,
    researchGroups,
    members,
    meta,
    mutateMeta,
    API,
  } = useAppContext();

  const unSubList: Unsubscribe[] = [];

  async function loadData() {
    try {
      busyDialog.show("Loading data...");

      unSubList.push(
        API.ResearchGroups.subscribe((data) => {
          data.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
          researchGroups.reload(data);
        }),
      );

      unSubList.push(
        API.UpcomingEvents.subscribe((data) => {
          data.sort((a, b) => a.startsAt.seconds - b.startsAt.seconds);
          upcomingEvents.reload(data);
        }),
      );

      unSubList.push(
        API.PastEvents.subscribe((data) => {
          data.sort((a, b) => b.startsAt.seconds - a.startsAt.seconds);
          pastEvents.reload(data);
        }),
      );

      unSubList.push(
        API.News.subscribe((data) => {
          data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
          news.reload(data);
        }),
      );

      unSubList.push(
        API.Members.subscribe((data) => {
          members.reload(data);
        }),
      );

      unSubList.push(
        API.Meta.subscribe((data) => {
          mutateMeta((state) => {
            if (data.length > 0) {
              state.id = data[0].id;
              state.membersDisplayOrder = data[0].membersDisplayOrder;
              state.createdAt = data[0].createdAt;
            }
          });
        }),
      );

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  return { loadData, unSubList };
}
