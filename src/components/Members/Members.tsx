import "./members.css";

import { For, onCleanup, onMount, Show } from "solid-js";
import MemberItem from "~/components/Members/MemberItem";
import Img from "~/components/common/Img";
import {
  scrollBottomAnimation,
  scrollWithAnimation,
  sleep,
} from "~/utils/utils";

import CreateEditMember, {
  CreateEditMemberDialogResult,
} from "~/components/Members/CreateEditMember";
import { DialogResult } from "~/components/MessageBox/store";
import Scrollable from "~/components/common/Scrollable";
import DragToReorder from "~/components/DragToReorder";
import MembersHeader from "~/assets/images/members-header.png";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";

export default function Members() {
  const { isAdmin, busyDialog, messageBox, members, meta, API } =
    useAppContext();

  let createEditMemberDialog: HTMLDialogElement = null!;

  async function onAddNew() {
    const dialogResult =
      await createEditMemberDialog.ShowModal<CreateEditMemberDialogResult>();
    if (dialogResult.result === "Cancel") return;

    try {
      busyDialog.show("Creating a new member...");

      // Begin transaction
      API.Members.beginTransaction();

      // Add new member
      const newMemberId = await API.Members.add({
        name: dialogResult.member.name,
        image: dialogResult.member.image,
        role: dialogResult.member.role,
        isSelected: false,
      });

      // Use the same batch for updating meta
      API.Meta.batch = API.Members.batch;

      // Update meta
      await API.Meta.update({
        original: meta,
        changes: {
          membersDisplayOrder: [...meta.membersDisplayOrder, newMemberId],
        },
      });

      // Commit transaction
      await API.Members.commitTransaction();
      // Clear batch in Meta
      API.Meta.batch = undefined;

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  async function onDeleteSelectedMembers() {
    if (members.selectedIds.length === 0) return;

    // Ask for confirmation
    const result = await messageBox.question(
      `Are you sure you want to delete the selected members?`,
    );

    if (result !== DialogResult.Yes) return;

    try {
      busyDialog.show("Deleting selected members...");

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

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  async function onDragFinished(
    draggingItemId: string,
    oldIndex: number,
    newIndex: number,
  ) {
    if (oldIndex === newIndex) return;

    try {
      busyDialog.show("Updating member order...");

      await API.Meta.update({
        original: meta,
        changes: {
          membersDisplayOrder: meta.membersDisplayOrder.toMoved(
            oldIndex,
            newIndex,
          ),
        },
      });

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  const icon = <Img src={MembersHeader} height={"35px"} />;

  return (
    <BlockContainer
      title={"Members"}
      titleIcon={icon}
      onAddNewItem={isAdmin() ? onAddNew : undefined}
      onDeleteSelectedItems={isAdmin() ? onDeleteSelectedMembers : undefined}
      style={{ height: "100%", width: "20%", "min-width": "20%" }}
    >
      <Show
        when={isAdmin()}
        fallback={<MemberContainer editDialog={() => createEditMemberDialog} />}
      >
        <DragToReorder ids={members.ids} onDragFinish={onDragFinished}>
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

  let timeOut: any;
  let membersScrollableContainer: HTMLDivElement = null!;
  let membersAnimationContainer: HTMLDivElement = null!;
  let scrollAnimation: Animation | undefined;
  let scrollAnimationTimer: NodeJS.Timeout = null!;

  // onMount(() => {
  //   if (isAdmin()) {
  //     // admin page
  //   } else {
  //     // index page
  //     timeOut = setTimeout(scroll, 5000);
  //   }
  // });

  onMount(async () => {
    if (isAdmin()) {
      // If landed on admin page, don't run scroll animation
    } else {
      onMountClient().then();
    }
  });

  async function onMountClient() {
    // Wait for news to be loaded
    await sleep(3000);

    // Run scroll animation
    runScrollAnimation().then();
  }

  // onCleanup(() => {
  //   if (isAdmin()) {
  //     // admin page
  //   } else {
  //     // index page
  //     clearTimeout(timeOut);
  //   }
  // });

  onCleanup(() => {
    // Stop restart timer
    if (scrollAnimationTimer) {
      clearTimeout(scrollAnimationTimer);
    }

    // Cancel active animation
    if (scrollAnimation && scrollAnimation.playState !== "finished") {
      scrollAnimation.cancel();
    }
  });

  // async function scroll() {
  //   await scrollBottomAnimation(membersScrollableContainer, 2000);
  //   timeOut = setTimeout(scroll, 5000);
  // }

  async function runScrollAnimation() {
    // Start animation and wait for it to finish
    try {
      scrollAnimation = scrollWithAnimation({
        animationContainer: membersAnimationContainer,
        scrollDirection: "down",
        totalItemDistance: membersAnimationContainer.scrollHeight,
        viewPortDistance: membersScrollableContainer.clientHeight - 16,
        pixelsPerSecondToScroll: 50,
        stayAtRestDurationInMsAfterScroll: 3000,
        pixelsPerSecondToReturnBack: 1000,
      });

      await scrollAnimation?.finished;

      // Restart animation after 2 seconds
      scrollAnimationTimer = setTimeout(() => {
        runScrollAnimation();
      }, 2000);
    } catch (e) {
      // Try to restart animation after 60 seconds
      // TODO: Make this 60 seconds when completed
      scrollAnimationTimer = setTimeout(() => {
        runScrollAnimation();
      }, 60000);
    }
  }

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
