import { createEffect, on, Show } from "solid-js";
import Img from "~/components/common/Img";
import MemberImagePlaceholder from "~/assets/images/member-placeholder.png";
import ImageCropDialog, { ImageCropResult } from "~/components/ImageCropDialog";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import { Member } from "~/api/types";
import Dialog, {
  createDialogContext,
  DialogControls,
  DialogRef,
} from "~/components/common/Dialog";
import ImageSelectInput from "~/components/ImageSelectInput";
import { useAppContext } from "~/AppContext";
import { detectChanges } from "~/utils/utils";

export type CreateEditMemberDialogResult = {
  result: "Accept" | "Cancel";
  mode: "create" | "edit";
  member: Omit<Member, "createdAt">;
};

const { ContextProvider, useDialogContext } =
  createDialogContext<CreateEditMemberDialogResult>({
    result: "Cancel",
    mode: "create",
    member: { id: "", name: "", role: "", image: "", isSelected: false },
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

  const { API, meta, Executor, members } = useAppContext();

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
            state.member.id = member.id;
            state.member.name = member.name;
            state.member.role = member.role;
            state.member.image = member.image;
            state.member.isSelected = false;
          } else {
            state.mode = "create";
            state.member = {
              id: "",
              name: "",
              role: "",
              image: "",
              isSelected: false,
            };
          }
        });
      }}
      onClose={async (ev) => {
        (ev.target as HTMLDialogElement).Resolve(state);
        if (state.result === "Cancel") return;

        switch (state.mode) {
          case "create":
            await Executor.run(
              async () => {
                API.Members.beginTransaction();
                const newMemberId = await API.Members.add({
                  ...state.member,
                });
                API.Meta.batch = API.Members.batch;
                await API.Meta.update({
                  original: meta,
                  changes: {
                    membersDisplayOrder: [
                      ...meta.membersDisplayOrder,
                      newMemberId,
                    ],
                  },
                });
                await API.Members.commitTransaction();
                API.Meta.batch = undefined;
              },
              {
                busyDialogMessage: "Creating a new member...",
                postAction: () => {
                  // Scroll to the bottom
                  const membersScrollableContainer = document.querySelector(
                    ".members-scrollable-container",
                  );
                  if (membersScrollableContainer) {
                    membersScrollableContainer.scrollTo({
                      behavior: "smooth",
                      top: membersScrollableContainer.scrollHeight,
                    });
                  }
                },
              },
            );
            break;
          case "edit":
            await Executor.run(
              () =>
                API.Members.update({
                  original: members.entities[state.member.id],
                  changes: detectChanges(
                    members.entities[state.member.id],
                    state.member,
                  ),
                }),
              { busyDialogMessage: "Updating member..." },
            );
            break;
        }
      }}
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
        onAccept={async () => {
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

  let imageCropDialog: HTMLDialogElement = null!;

  return (
    <Show when={state !== undefined}>
      <Row class={"avatar"}>
        <Img src={state.member.image || MemberImagePlaceholder} />
        <ImageSelectInput
          onImageSelected={async (image) => {
            const reader = new FileReader();
            const result = await reader.readAsyncAsDataURL(image);
            if (!result || typeof result !== "string" || result === "") return;
            const dResult =
              await imageCropDialog.ShowModal<ImageCropResult>(result);
            if (dResult.result === "Cancel") return;
            mutate((state) => (state.member.image = dResult.croppedImage));
          }}
        />

        <ImageCropDialog
          ref={imageCropDialog}
          aspectRatio={250 / 300}
          rounded={"full"}
        />
      </Row>
    </Show>
  );
}

function TextInfo() {
  const { state, mutate } = useDialogContext();

  // Update height of role textarea
  createEffect(
    on(
      () => state?.member.role,
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
    <Show when={state !== undefined}>
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
            mutate(
              (state) => (state.member.role = e.currentTarget.value || ""),
            );
          }}
          placeholder={"Member Role"}
          class={"role"}
        />
      </Column>
    </Show>
  );
}
