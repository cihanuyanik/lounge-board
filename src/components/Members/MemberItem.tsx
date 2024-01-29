import Img from "~/components/common/Img";
import MemberImagePlaceholder from "~/assets/images/member-placeholder.png";
import { CreateEditMemberDialogResult } from "~/components/Members/CreateEditMember";
import DragHandle from "~/components/DragToReorder/DragHandle";
import { Show } from "solid-js";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import { useAppContext } from "~/AppContext";

type MemberItemProps = {
  id: string;
  editDialog?: HTMLDialogElement;
};

export default function MemberItem(props: MemberItemProps) {
  const { isAdmin, busyDialog, messageBox, members, API } = useAppContext();

  function onClick() {
    const memberItem = members.entities[props.id];
    if (memberItem.isSelected) members.unselect(memberItem.id);
    else members.select(memberItem.id);
  }

  async function onDoubleClick() {
    if (!props.editDialog) return;
    const dResult =
      await props.editDialog.ShowModal<CreateEditMemberDialogResult>(
        members.entities[props.id],
      );
    if (dResult.result === "Cancel") return;

    try {
      busyDialog.show("Updating member...");

      await API.Members.update({
        original: members.entities[props.id],
        changes: {
          name: dResult.member.name,
          role: dResult.member.role,
          image: dResult.member.image,
        },
      });

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  return (
    <Row
      id={props.id}
      class={"member-item"}
      classList={{
        "drag-item": isAdmin(),
        "cursor-pointer": isAdmin(),
        "item-selected": members.entities[props.id]?.isSelected,
      }}
      onclick={isAdmin() ? onClick : undefined}
      ondblclick={isAdmin() ? onDoubleClick : undefined}
    >
      <Row class={"avatar"}>
        <Img
          src={members.entities[props.id]?.image || MemberImagePlaceholder}
        />
      </Row>

      <Column class={"name-role"}>
        <Row class={"name"}>{members.entities[props.id]?.name}</Row>
        <Row class={"role"}>{members.entities[props.id]?.role}</Row>
      </Column>

      <Show when={isAdmin()}>
        <DragHandle />
      </Show>
    </Row>
  );
}
