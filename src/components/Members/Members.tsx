import styles from "./members.module.scss";
import { For, onCleanup, onMount, Show } from "solid-js";
import MemberItem from "~/components/Members/MemberItem";
import CreateEditMember from "~/components/Members/CreateEditMember";
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

  let updateDialog: HTMLDialogElement = null!;

  return (
    <BlockContainer
      as={"members-block"}
      title={"Members"}
      titleIcon={MembersHeader}
      class={styles.blockContainer}
      onAddNewItem={!isAdmin() ? undefined : () => updateDialog.ShowModal()}
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
        fallback={<MemberContainer editDialog={() => updateDialog} />}
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
          <MemberContainer editDialog={() => updateDialog} />
        </DragToReorder>
        <CreateEditMember ref={updateDialog} />
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
      as={"scrollable"}
      ref={membersScrollableContainer}
      hideScrollbar={true}
      class={styles.scrollable}
    >
      {/*@ts-ignore*/}
      <scroll-wrapper ref={membersAnimationContainer} class={styles.wrapper}>
        <For each={meta.membersDisplayOrder}>
          {(id) => <MemberItem id={id} editDialog={props.editDialog()} />}
        </For>
        {/*@ts-ignore*/}
      </scroll-wrapper>
    </Scrollable>
  );
}
