import "./members.css";
import { For, onCleanup, onMount, Show } from "solid-js";
import MemberItem from "~/components/Members/MemberItem";
import Img from "~/components/common/Img";
import CreateEditMember, {
  CreateEditMemberDialogResult,
} from "~/components/Members/CreateEditMember";
import { DialogResult } from "~/components/MessageBox/store";
import Scrollable from "~/components/common/Scrollable";
import DragToReorder from "~/components/DragToReorder";
import MembersHeader from "~/assets/images/members-header.png";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";
import ContinuesScrollAnimator from "~/utils/ContinuesScrollAnimator";
import { sleep } from "~/utils/utils";

export default function Members() {
  const { isAdmin, messageBox, members, meta, Executor, API } = useAppContext();

  let createEditMemberDialog: HTMLDialogElement = null!;

  const icon = <Img src={MembersHeader} height={"35px"} />;

  return (
    <BlockContainer
      title={"Members"}
      titleIcon={icon}
      class={"members-block-container"}
      onAddNewItem={
        !isAdmin()
          ? undefined
          : async () => {
              const dResult =
                await createEditMemberDialog.ShowModal<CreateEditMemberDialogResult>();
              if (dResult.result === "Cancel") return;

              await Executor.run(
                async () => {
                  API.Members.beginTransaction();
                  const newMemberId = await API.Members.add({
                    ...dResult.member,
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
            }
      }
      onDeleteSelectedItems={
        !isAdmin()
          ? undefined
          : async () => {
              if (members.selectedIds.length === 0) return;

              // Ask for confirmation
              const result = await messageBox.question(
                `Are you sure you want to delete the selected members?`,
              );

              if (result !== DialogResult.Yes) return;

              await Executor.run(
                async () => {
                  // Begin transaction
                  API.Members.beginTransaction();

                  // Iterate over selectedIds
                  for (const selectedId of members.selectedIds) {
                    await API.Members.delete(members.entities[selectedId]);
                  }

                  // Remove selectedIds from display order
                  const newIds = meta.membersDisplayOrder.filter(
                    (id) => !members.selectedIds.includes(id),
                  );

                  // Use the same batch for updating meta
                  API.Meta.batch = API.Members.batch;

                  // Update meta
                  await API.Meta.update({
                    original: meta,
                    changes: {
                      membersDisplayOrder: newIds,
                    },
                  });

                  // Commit transaction
                  await API.Members.commitTransaction();
                  // Clear batch in Meta
                  API.Meta.batch = undefined;
                },
                {
                  busyDialogMessage: "Deleting selected members...",
                },
              );
            }
      }
    >
      <Show
        when={isAdmin()}
        fallback={<MemberContainer editDialog={() => createEditMemberDialog} />}
      >
        <DragToReorder
          ids={members.ids}
          onDragFinish={async (oldIndex, newIndex) => {
            if (oldIndex === newIndex) return;

            await Executor.run(
              () =>
                API.Meta.update({
                  original: meta,
                  changes: {
                    membersDisplayOrder: meta.membersDisplayOrder.toMoved(
                      oldIndex,
                      newIndex,
                    ),
                  },
                }),
              {
                busyDialogMessage: "Updating member order...",
              },
            );
          }}
        >
          <MemberContainer editDialog={() => createEditMemberDialog} />
        </DragToReorder>
      </Show>

      <Show when={isAdmin()}>
        {<CreateEditMember ref={createEditMemberDialog} />}
      </Show>
    </BlockContainer>
  );
}

function MemberContainer(props: { editDialog: () => HTMLDialogElement }) {
  const { isAdmin, meta } = useAppContext();

  let membersScrollableContainer: HTMLDivElement = null!;
  let membersAnimationContainer: HTMLDivElement = null!;

  let scrollAnimator: ContinuesScrollAnimator = null!;

  onMount(async () => {
    if (isAdmin()) {
      // If landed on admin page, don't run scroll animation
    } else {
      onMountClient().then();
    }
  });

  async function onMountClient() {
    // Wait for members to be loaded
    await sleep(3000);

    scrollAnimator = new ContinuesScrollAnimator({
      animationContainer: () => membersAnimationContainer,
      scrollDirection: "down",
      totalItemDistance: () => membersAnimationContainer.scrollHeight,
      viewPortDistance: () => membersScrollableContainer.clientHeight - 16,
      pixelsPerSecondToScroll: 25,
      stayAtRestDurationInMsAfterScroll: 3000,
      pixelsPerSecondToReturnBack: 1000,
    });
    scrollAnimator.run(2000).then();
  }

  onCleanup(() => scrollAnimator?.stop());

  return (
    <Scrollable
      ref={membersScrollableContainer}
      direction={"vertical"}
      hideScrollbar={true}
      class={"members-scrollable-container"}
    >
      <div
        ref={membersAnimationContainer}
        class={"members-scroll-animation-wrapper"}
      >
        <For each={meta.membersDisplayOrder}>
          {(id) => <MemberItem id={id} editDialog={props.editDialog()} />}
        </For>
      </div>
    </Scrollable>
  );
}
