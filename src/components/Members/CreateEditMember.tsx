import "./members.scss";
import { emptyMember } from "~/components/Members/store";
import { createStore } from "solid-js/store";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import MemberImagePlaceholder from "~/assets/images/member-placeholder.png";
import Edit from "~/assets/icons/Edit";
import ImageCropDialog, { ImageCropResult } from "~/components/ImageCropDialog";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import { Member } from "~/api/types";
import Dialog, { DialogRef } from "~/components/common/Dialog";
import { createMutator } from "~/utils/utils";
import { createContext, useContext } from "solid-js";

export type CreateEditMemberDialogResult = {
  result: "Accept" | "Cancel";
  member: Member;
};

function createDialogStore() {
  // create store
  const [state, setState] = createStore<CreateEditMemberDialogResult>({
    result: "Cancel",
    // @ts-ignore
    member: emptyMember(),
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

export default function CreateEditMember(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditMember ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditMember(props: { ref: DialogRef }) {
  const { state, mutate } = useDialogContext();
  function onBeforeShow(ev: CustomEvent) {
    const member = ev.detail as Member;
    mutate((state) => {
      state.member = member ? { ...member, isSelected: false } : emptyMember();
    });
  }

  return (
    <Dialog
      id={"create-edit-member-dialog"}
      class={"create-edit-member-dialog"}
      ref={props.ref}
      onBeforeShow={onBeforeShow}
      onClose={(ev) => (ev.target as HTMLDialogElement).Resolve(state)}
    >
      <Row class={"member-item"}>
        <Avatar />
        <TextInfo />
      </Row>

      <>
        <Button
          class={"control-btn accept"}
          onClick={() => {
            mutate((state) => (state.result = "Accept"));
            const dialog = document.getElementById(
              "create-edit-member-dialog",
            ) as HTMLDialogElement | null;
            dialog?.Close();
          }}
        >
          <Tick />
        </Button>

        <Button
          class={"control-btn cancel"}
          onClick={() => {
            // setDialogStore("result", "Cancel");
            mutate((state) => (state.result = "Cancel"));
            const dialog = document.getElementById(
              "create-edit-member-dialog",
            ) as HTMLDialogElement | null;
            dialog?.Close();
          }}
        >
          <Cross />
        </Button>
      </>
    </Dialog>
  );
}

function Avatar() {
  const { state, mutate } = useDialogContext();
  let imageCropDialog: HTMLDialogElement = null!;
  let imageSelectInput: HTMLInputElement;

  function onImageSelected() {
    if (!imageSelectInput.files) return;
    if (imageSelectInput.files.length === 0) return;
    if (
      imageSelectInput.files[0].type !== "image/png" &&
      imageSelectInput.files[0].type !== "image/jpeg"
    )
      return;

    const image = imageSelectInput.files[0];
    const reader = new FileReader();

    reader.onload = async (ev) => {
      if (ev.target === null) return;
      const dResult = await imageCropDialog.ShowModal<ImageCropResult>(
        ev.target?.result as string,
      );
      if (dResult.result === "Cancel") return;
      // setDialogStore("member", "image", dResult.croppedImage);
      mutate((state) => (state.member.image = dResult.croppedImage));
    };

    reader.readAsDataURL(image);
  }

  return (
    <Row
      class={"avatar"}
      onMouseEnter={() => {
        const editButton = document.getElementById("edit-member-image");
        if (editButton) editButton.style.opacity = "1";
      }}
    >
      <Img src={state.member.image || MemberImagePlaceholder} />

      <Button id={"edit-member-image"} onClick={() => imageSelectInput.click()}>
        <Edit />
      </Button>
      <input
        ref={(el) => (imageSelectInput = el)}
        type="file"
        accept="image/png, image/jpeg"
        hidden
        onClick={(e) => (e.currentTarget.value = "")}
        onInput={onImageSelected}
      />

      <ImageCropDialog
        ref={imageCropDialog}
        aspectRatio={250 / 300}
        rounded={"full"}
      />
    </Row>
  );
}

function TextInfo() {
  const { state, mutate } = useDialogContext();
  return (
    <Column class={"name-role"}>
      <input
        value={state.member.name}
        onInput={(e) =>
          mutate((state) => (state.member.name = e.target.value || ""))
        }
        placeholder={"Member Name"}
        class={"name"}
      />

      <textarea
        value={state.member.role}
        onInput={(e) =>
          mutate((state) => (state.member.role = e.target.value || ""))
        }
        placeholder={"Member Role"}
        class={"role"}
      />
    </Column>
  );
}
