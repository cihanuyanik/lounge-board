import { createEffect, on } from "solid-js";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import MemberImagePlaceholder from "~/assets/images/member-placeholder.png";
import Edit from "~/assets/icons/Edit";
import ImageCropDialog, { ImageCropResult } from "~/components/ImageCropDialog";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import { Member } from "~/api/types";
import Dialog, {
  createDialogContext,
  DialogControls,
  DialogRef,
} from "~/components/common/Dialog";

export type CreateEditMemberDialogResult = {
  result: "Accept" | "Cancel";
  mode: "create" | "edit";
  member: Omit<Member, "id" | "createdAt">;
};

const { ContextProvider, useDialogContext } =
  createDialogContext<CreateEditMemberDialogResult>({
    result: "Cancel",
    mode: "create",
    member: { name: "", role: "", image: "", isSelected: false },
  });

export default function CreateEditMember(props: { ref: DialogRef }) {
  return (
    <ContextProvider>
      <_CreateEditMember ref={props.ref} />
    </ContextProvider>
  );
}

function _CreateEditMember(props: { ref: DialogRef }) {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return null;

  return (
    <Dialog
      id={"create-edit-member-dialog"}
      class={"create-edit-member-dialog"}
      ref={props.ref}
      onAfterShow={(ev: CustomEvent) => {
        const member = ev.detail as Member;
        mutate((state) => {
          state.result = "Cancel";
          if (member) {
            state.mode = "edit";
            state.member.name = member.name;
            state.member.role = member.role;
            state.member.image = member.image;
            state.member.isSelected = false;
          } else {
            state.mode = "create";
            state.member = { name: "", role: "", image: "", isSelected: false };
          }
        });
      }}
      onClose={(ev) => (ev.target as HTMLDialogElement).Resolve(state)}
    >
      <Row class={"member-item"}>
        <Avatar />
        <TextInfo />
      </Row>

      <DialogControls
        // Disabled when: name or role or photo url is empty
        disabled={
          state.member.name === "" ||
          state.member.role === "" ||
          state.member.image === "" ||
          state.member.image === MemberImagePlaceholder
        }
        onAccept={() => {
          mutate((state) => (state.result = "Accept"));
          const dialog = document.getElementById(
            "create-edit-member-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
        onCancel={() => {
          mutate((state) => (state.result = "Cancel"));
          const dialog = document.getElementById(
            "create-edit-member-dialog",
          ) as HTMLDialogElement | null;
          dialog?.Close();
        }}
      />
    </Dialog>
  );
}

function Avatar() {
  const { state, mutate } = useDialogContext();
  if (state === undefined) return null;

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
      mutate((state) => (state.member.image = dResult.croppedImage));
    };

    reader.readAsDataURL(image);
  }

  return (
    <Row class={"avatar"}>
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
  if (state === undefined) return null;

  // Update height of role textarea
  createEffect(
    on(
      () => state.member.role,
      () => {
        if (roleTextArea) {
          roleTextArea.style.height = "";
          roleTextArea.style.height = roleTextArea.scrollHeight + "px";
        }
      },
    ),
  );

  let roleTextArea: HTMLTextAreaElement = null!;

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
        ref={roleTextArea}
        value={state.member.role}
        onInput={(e) => {
          mutate((state) => (state.member.role = e.currentTarget.value || ""));
        }}
        placeholder={"Member Role"}
        class={"role"}
      />
    </Column>
  );
}
