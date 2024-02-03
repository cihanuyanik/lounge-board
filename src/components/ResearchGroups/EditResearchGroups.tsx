import "./researchGroups.css";
import { createContext, For, useContext } from "solid-js";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import { createStore } from "solid-js/store";
import BannerPlaceholder from "~/assets/images/banner_placeholder.png";
import ResearchGroupPlaceholder from "~/assets/images/research-group-placeholder.png";
import { createMutator } from "~/utils/utils";
import { v4 as uuid } from "uuid";
import Delete from "~/assets/icons/Delete";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Add from "~/assets/icons/Add";
import { ResearchGroup } from "~/api/types";
import Dialog, { DialogControls, DialogRef } from "~/components/common/Dialog";
import Dropdown, { DropdownItem } from "~/components/common/Dropdown";

export type EditResearchGroupsDialogResult = {
  result: "Accept" | "Cancel";
  selectedId: string;
  ids: string[];
  entities: Record<string, ResearchGroup>;
};

function createDialogStore() {
  // create store
  const [state, setState] = createStore<EditResearchGroupsDialogResult>({
    result: "Cancel",
    selectedId: "",
    ids: [],
    entities: {},
  });

  // create mutator
  const mutate = createMutator(setState);

  return { state, mutate };
}

type ContextType = {} & ReturnType<typeof createDialogStore>;

const Context = createContext<ContextType>();

function ContextProvider(props: any) {
  const { state, mutate } = createDialogStore();

  return (
    <Context.Provider value={{ state, mutate }}>
      {props.children}
    </Context.Provider>
  );
}

function useDialogContext() {
  return useContext(Context) as ContextType;
}

export default function EditResearchGroupsDialog(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_EditResearchGroups ref={props.ref} />
    </ContextProvider>
  );
}

function _EditResearchGroups(props: { ref: DialogRef }) {
  const { state, mutate } = useDialogContext();
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
      class={"edit-research-groups-dialog"}
      ref={props.ref}
      onBeforeShow={onBeforeShow}
      onClose={(ev) => (ev.target as HTMLDialogElement).Resolve(state)}
    >
      <Column class={"content"}>
        <Row class={"title"}>{"Edit Research Groups"}</Row>
        <ResearchGroupSelector />
        <Row class={"selected-group"}>
          <ResearchGroupName />
          <BannerImage />
        </Row>

        <ResearchGroupTeamImage />
      </Column>

      <DialogControls
        onAccept={() => {
          mutate((state) => {
            state.result = "Accept";
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
  return (
    <input
      value={state.entities[state.selectedId]?.name}
      placeholder={"Research Group Name"}
      onInput={(e) => {
        mutate((state) => {
          state.entities[state.selectedId].name = e.target.value;
        });
      }}
      class={"research-group-name"}
    />
  );
}

function BannerImage() {
  const { state, mutate } = useDialogContext();

  let bannerImageInput: HTMLInputElement;

  function onImageSelected() {
    if (!bannerImageInput.files) return;
    if (bannerImageInput.files.length === 0) return;
    if (
      bannerImageInput.files[0].type !== "image/png" &&
      bannerImageInput.files[0].type !== "image/jpeg"
    )
      return;

    const image = bannerImageInput.files[0];
    const reader = new FileReader();

    reader.onload = (ev) => {
      if (ev.target === null) return;

      mutate((state) => {
        state.entities[state.selectedId].bannerImage = ev.target
          ?.result as string;
      });
    };

    reader.readAsDataURL(image);
  }

  return (
    <Row class={"banner-image"} onclick={() => bannerImageInput.click()}>
      <Img
        src={
          !state.entities[state.selectedId]?.bannerImage
            ? BannerPlaceholder
            : state.entities[state.selectedId]?.bannerImage
        }
      />
      <input
        ref={(el) => (bannerImageInput = el)}
        type="file"
        accept="image/png, image/jpeg"
        hidden
        onInput={onImageSelected}
      />
    </Row>
  );
}

function ResearchGroupTeamImage() {
  const { state, mutate } = useDialogContext();

  let rgImageInput: HTMLInputElement;

  function onImageSelected() {
    if (!rgImageInput.files) return;
    if (rgImageInput.files.length === 0) return;
    if (
      rgImageInput.files[0].type !== "image/png" &&
      rgImageInput.files[0].type !== "image/jpeg"
    )
      return;

    const image = rgImageInput.files[0];
    const reader = new FileReader();

    reader.onload = (ev) => {
      if (ev.target === null) return;

      mutate((state) => {
        state.entities[state.selectedId].image = ev.target?.result as string;
      });
    };

    reader.readAsDataURL(image);
  }

  return (
    <Row
      class={"research-group-team-image"}
      onclick={() => rgImageInput.click()}
    >
      <Img
        src={
          !state.entities[state.selectedId]?.image
            ? ResearchGroupPlaceholder
            : state.entities[state.selectedId]?.image
        }
      />
      <input
        ref={(el) => (rgImageInput = el)}
        type="file"
        accept="image/png, image/jpeg"
        hidden
        onInput={onImageSelected}
      />
    </Row>
  );
}

function ResearchGroupSelector() {
  const { state, mutate } = useDialogContext();

  function onNewResearchGroup() {
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
    });
  }

  function onDeleteResearchGroup() {
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
    });
  }

  return (
    <Row class={"research-group-selector"}>
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
            console.log(id);
            return (
              <DropdownItem value={id}>{state.entities[id].name}</DropdownItem>
            );
          }}
        </For>
      </Dropdown>

      <Button onClick={onDeleteResearchGroup}>
        <Delete />
      </Button>

      <Button onClick={onNewResearchGroup}>
        <Add />
      </Button>
    </Row>
  );
}
