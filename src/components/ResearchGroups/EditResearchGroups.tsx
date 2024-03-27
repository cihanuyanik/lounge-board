import styles from "./researchGroups.module.scss";
import { For } from "solid-js";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import BannerPlaceholder from "~/assets/images/banner_placeholder.png";
import ResearchGroupPlaceholder from "~/assets/images/research-group-placeholder.png";
import { v4 as uuid } from "uuid";
import Delete from "~/assets/icons/Delete";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import Add from "~/assets/icons/Add";
import { ResearchGroup } from "~/api/types";
import Dialog, {
  createDialogContext,
  DialogControls,
  DialogRef,
} from "~/components/common/Dialog";
import Dropdown, { DropdownItem } from "~/components/common/Dropdown";
import ImageSelectInput from "~/components/ImageSelectInput";
import { useAppContext } from "~/AppContext";

export type EditResearchGroupsDialogResult = {
  result: "Accept" | "Cancel";
  selectedId: string;
  ids: string[];
  entities: Record<string, ResearchGroup>;
};

const { ContextProvider, useDialogContext } =
  createDialogContext<EditResearchGroupsDialogResult>({
    result: "Cancel",
    selectedId: "",
    ids: [],
    entities: {},
  });

export default function EditResearchGroupsDialog(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_EditResearchGroups ref={props.ref} />
    </ContextProvider>
  );
}

function _EditResearchGroups(props: { ref: DialogRef }) {
  const { state, mutate } = useDialogContext();
  const { API, researchGroups, Executor } = useAppContext();

  function onBeforeShow(ev: CustomEvent) {
    const researchGroups = ev.detail as {
      ids: string[];
      entities: Record<string, ResearchGroup>;
    };

    if (!researchGroups) return;

    mutate((state) => {
      state.ids = [];
      state.entities = {};

      if (researchGroups.ids.length === 0) {
        const id = uuid();
        state.ids.push(id);
        state.entities[id] = {
          id: id,
          name: "New Research Group",
          bannerImage: "",
          image: "",
          // @ts-ignore
          createdAt: new Date(),
        };
        state.selectedId = id;
      } else {
        // Copy from researchGroups to dialogStore
        for (const id of researchGroups.ids) {
          state.ids.push(id);
          state.entities[id] = { ...researchGroups.entities[id] };
        }
      }

      if (state.ids.length > 0) state.selectedId = state.ids[0];
    });
  }

  return (
    <Dialog
      id={"edit-research-groups-dialog"}
      class={styles.editDialog}
      ref={props.ref}
      onBeforeShow={onBeforeShow}
      onClose={async (ev) => {
        (ev.target as HTMLDialogElement).Resolve(state);
        if (state.result === "Cancel") return;

        await Executor.run(
          async () => {
            // Separate the ids into categories
            // ============================================
            let dResultIds = [...state.ids];
            const dResultEntities = state.entities;

            // Detect the new ones and the ones that were removed
            const newGroupIds = dResultIds.filter(
              (id) => !researchGroups.ids.includes(id),
            );

            // Remove the ones marked as new
            dResultIds = dResultIds.filter((id) => !newGroupIds.includes(id));

            // Detect the removed ones
            const removedGroupIds = researchGroups.ids.filter(
              (id) => !dResultIds.includes(id),
            );
            // Remove the ones marked as removed
            dResultIds = dResultIds.filter(
              (id) => !removedGroupIds.includes(id),
            );

            // Remaining ids are the ones that were updated
            const updatedGroupIds = dResultIds;

            // ============================================
            // Update firestore
            // ============================================
            API.ResearchGroups.beginTransaction();

            // Insert new ones
            for (const id of newGroupIds) {
              await API.ResearchGroups.add({
                name: dResultEntities[id].name,
                image: dResultEntities[id].image,
                bannerImage: dResultEntities[id].bannerImage,
              });
            }

            // Delete the ones that were removed
            for (const id of removedGroupIds) {
              await API.ResearchGroups.delete(researchGroups.entities[id]);
            }

            // Update firestore for the ones that were changed
            for (const id of updatedGroupIds) {
              await API.ResearchGroups.update({
                original: researchGroups.entities[id],
                changes: {
                  name: dResultEntities[id].name,
                  image: dResultEntities[id].image,
                  bannerImage: dResultEntities[id].bannerImage,
                },
              });
            }

            await API.ResearchGroups.commitTransaction();

            // ============================================
          },
          {
            busyDialogMessage: "Updating research groups...",
          },
        );
      }}
    >
      <Column class={styles.content}>
        <Row class={styles.title}>{"Edit Research Groups"}</Row>
        <ResearchGroupSelector />
        <Row class={styles.selectedGroup}>
          <ResearchGroupName />
          <BannerImage />
        </Row>

        <ResearchGroupTeamImage />
      </Column>

      <DialogControls
        onAccept={() => {
          mutate((state) => {
            state.result = "Accept";

            // Remove New Research Group from the list
            const deletedIds = [] as string[];
            for (const id of state.ids) {
              const entity = state.entities[id];
              if (entity.name === "New Research Group") {
                delete state.entities[id];
                deletedIds.push(id);
              }
            }

            state.ids = state.ids.filter((id) => !deletedIds.includes(id));
          });

          const dialog = document.getElementById(
            "edit-research-groups-dialog",
          ) as HTMLDialogElement | null;

          dialog?.Close();
        }}
        onCancel={() => {
          mutate((state) => {
            state.result = "Cancel";
          });
          const dialog = document.getElementById(
            "edit-research-groups-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      />
    </Dialog>
  );
}

function ResearchGroupName() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return;

  return (
    <input
      value={state.entities[state.selectedId]?.name}
      placeholder={"Research Group Name"}
      onInput={(e) => {
        mutate(
          (state) => (state.entities[state.selectedId].name = e.target.value),
        );
      }}
      class={styles.rgname}
    />
  );
}

function BannerImage() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return;

  return (
    <Row class={styles.banner}>
      <Img
        src={
          !state.entities[state.selectedId]?.bannerImage
            ? BannerPlaceholder
            : state.entities[state.selectedId]?.bannerImage
        }
      />
      <ImageSelectInput
        onImageSelected={async (image) => {
          const reader = new FileReader();
          const result = await reader.readAsyncAsDataURL(image);
          if (result === null || typeof result !== "string" || result === "")
            return;

          mutate(
            (state) => (state.entities[state.selectedId].bannerImage = result),
          );
        }}
      />
    </Row>
  );
}

function ResearchGroupTeamImage() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return;

  return (
    <Row class={styles.rgTeamImage}>
      <Img
        src={
          !state.entities[state.selectedId]?.image
            ? ResearchGroupPlaceholder
            : state.entities[state.selectedId]?.image
        }
      />
      <ImageSelectInput
        onImageSelected={async (image) => {
          const reader = new FileReader();
          const result = await reader.readAsyncAsDataURL(image);
          if (result === null || typeof result !== "string" || result === "")
            return;

          mutate((state) => (state.entities[state.selectedId].image = result));
        }}
      />
    </Row>
  );
}

function ResearchGroupSelector() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return;

  return (
    <Row class={styles.rgselector}>
      <Dropdown
        rootStyle={{ flex: "1", height: "40px" }}
        value={state.selectedId}
        onValueChanged={(ev) => {
          mutate((state) => {
            state.selectedId = ev.value;
          });
        }}
      >
        <For each={state.ids}>
          {(id) => {
            return (
              <DropdownItem value={id}>{state.entities[id].name}</DropdownItem>
            );
          }}
        </For>
      </Dropdown>

      <Button
        onClick={() =>
          mutate((state) => {
            state.ids = state.ids.filter((id) => id !== state.selectedId);
            delete state.entities[state.selectedId];

            if (state.ids.length === 0) {
              const id = uuid();
              state.ids.push(id);
              state.entities[id] = {
                id: id,
                name: "New Research Group",
                bannerImage: "",
                image: "",
                // @ts-ignore
                createdAt: new Date(),
              };
              state.selectedId = id;
            } else {
              state.selectedId = state.ids[0];
            }
          })
        }
        popupContent={"Delete active research group."}
        popupDirection={"bottom-left"}
      >
        <Delete />
      </Button>

      <Button
        onClick={() =>
          mutate((state) => {
            const id = uuid();
            state.ids.push(id);
            state.entities[id] = {
              id: id,
              name: "New Research Group",
              bannerImage: "",
              image: "",
              // @ts-ignore
              createdAt: new Date(),
            };
            state.selectedId = id;
          })
        }
        popupContent={"Add new research group."}
        popupDirection={"bottom-left"}
      >
        <Add />
      </Button>
    </Row>
  );
}
