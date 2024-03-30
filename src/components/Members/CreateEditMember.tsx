import styles from "./members.module.scss";
import { createEffect, on, Show } from "solid-js";
import MemberImagePlaceholder from "~/assets/images/member-placeholder.png";
import Row from "~/components/common/Flex/Row";
import Column from "~/components/common/Flex/Column";
import { Member } from "~/api/types";
import Dialog, {
  createDialogContext,
  DialogControls,
  DialogRef,
} from "~/components/common/Dialog";
import { useAppContext } from "~/AppContext";
import { detectChanges } from "~/utils/utils";
import Avatar from "~/components/common/Avatar";

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
      class={styles.editDialog}
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
      <Row as={"member-item"} class={styles.memberItem}>
        <Avatar
          imgSrc={state.member.image}
          enableImageSelect={true}
          enableImageCrop={true}
          onImageSelected={(image) =>
            mutate((state) => (state.member.image = image))
          }
        />
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
      <Column as={"member-info"} class={styles.nrContainer}>
        <input
          value={state.member.name}
          onInput={(e) =>
            mutate((state) => (state.member.name = e.target.value || ""))
          }
          placeholder={"Member Name"}
          class={styles.name}
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
          class={styles.role}
        />
      </Column>
    </Show>
  );
}
