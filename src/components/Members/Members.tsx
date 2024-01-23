import "./members.scss";

import { For, onCleanup, onMount, Show } from "solid-js";
import MemberItem from "~/components/Members/MemberItem";
import Img from "~/components/common/Img";
import { scrollBottomAnimation } from "~/utils/utils";

import CreateEditMember, {
  CreateEditMemberDialogResult,
} from "~/components/Members/CreateEditMember";
import { DialogResult } from "~/components/MessageBox/store";
import Scrollable from "~/components/common/Scrollable";
import DragToReorder from "~/components/DragToReorder";
import MembersHeader from "~/assets/images/members-header.png";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";
import { API } from "~/api/Firebase";

export default function Members() {
  const { isAdmin, busyDialog, messageBox, members, meta } = useAppContext();

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
      style={{ height: "100%", width: "400px" }}
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

  let memberContainer: HTMLDivElement;
  let timeOut: any;

  onMount(() => {
    if (isAdmin()) {
      // admin page
    } else {
      // index page
      timeOut = setTimeout(scroll, 5000);
    }
  });

  onCleanup(() => {
    if (isAdmin()) {
      // admin page
    } else {
      // index page
      clearTimeout(timeOut);
    }
  });

  async function scroll() {
    await scrollBottomAnimation(memberContainer, 2000);
    timeOut = setTimeout(scroll, 5000);
  }

  return (
    <Scrollable
      ref={(el) => (memberContainer = el)}
      direction={"vertical"}
      hideScrollbar={true}
      class={"members-container"}
    >
      <For each={meta.membersDisplayOrder}>
        {(id) => <MemberItem id={id} editDialog={props.editDialog()} />}
      </For>
    </Scrollable>
  );
}
