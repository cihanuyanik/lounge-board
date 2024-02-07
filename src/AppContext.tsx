import {
  Accessor,
  createContext,
  createMemo,
  createSignal,
  Setter,
  useContext,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { createNewsStore } from "~/components/News/store";
import { createResearchGroupStore } from "~/components/ResearchGroups/store";
import { createMemberStore } from "~/components/Members/store";
import { createBusyDialogStore } from "~/components/BusyDialog/store";
import { createMessageBoxStore } from "~/components/MessageBox/store";
import { createStore } from "solid-js/store";
import { Meta, User } from "~/api/types";
import { Event } from "~/api/types";
import { createMutator } from "~/utils/utils";
import { Firebase } from "~/api/Firebase";
import { createEventStore } from "~/components/Events/store";
import AsyncExecutor from "~/utils/AsyncExecutor";

type AppContextType = {
  isAdmin: Accessor<boolean>;
  user: Accessor<User>;
  setUser: Setter<User>;
  API: Firebase;
  Executor: AsyncExecutor;
} & ReturnType<typeof createEventStore> & // ReturnType<typeof createUpcomingEventStore> & // ReturnType<typeof createPastEventStore> &
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

  const { events, mutateEvents } = createEventStore();

  const { news, mutateNews } = createNewsStore();

  const { researchGroups, mutateResearchGroups } = createResearchGroupStore();

  const { members, mutateMembers } = createMemberStore();

  const { meta, mutateMeta } = createMetaStore();

  const [user, setUser] = createSignal<User>(null!);

  const API = new Firebase();

  const Executor = new AsyncExecutor(busyDialog, messageBox);

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        events,
        mutateEvents,
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
        Executor,
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
    events,
    news,
    researchGroups,
    members,
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
        API.Events.subscribe((data) => {
          // Separate upcoming and past events
          const upcomingEvents: Event[] = [];
          const pastEvents: Event[] = [];
          for (const event of data) {
            if (event.isPast) {
              pastEvents.push(event);
            } else {
              upcomingEvents.push(event);
            }
          }

          upcomingEvents.sort(
            (a, b) => a.startsAt.seconds - b.startsAt.seconds,
          );
          pastEvents.sort((a, b) => b.startsAt.seconds - a.startsAt.seconds);
          events.reload([...upcomingEvents, ...pastEvents]);
        }),
      );

      unSubList.push(
        API.News.subscribe((data) => {
          data.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
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
