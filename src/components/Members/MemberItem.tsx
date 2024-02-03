import Img from "~/components/common/Img";
import MemberImagePlaceholder from "~/assets/images/member-placeholder.png";
import { CreateEditMemberDialogResult } from "~/components/Members/CreateEditMember";
import DragHandle from "~/components/DragToReorder/DragHandle";
import { Show } from "solid-js";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import { useAppContext } from "~/AppContext";
import Tick from "~/assets/icons/Tick";
import { detectChanges } from "~/utils/utils";

type MemberItemProps = {
  id: string;
  editDialog?: HTMLDialogElement;
};

export default function MemberItem(props: MemberItemProps) {
  const { isAdmin, members, Executor, API } = useAppContext();

  return (
    <Row
      id={props.id}
      class={"member-item"}
      classList={{
        "drag-item": isAdmin(),
        "cursor-pointer": isAdmin(),
        "item-selected": members.entities[props.id]?.isSelected,
      }}
      onclick={
        !isAdmin()
          ? undefined
          : () => {
              const memberItem = members.entities[props.id];
              if (memberItem.isSelected) members.unselect(memberItem.id);
              else members.select(memberItem.id);
            }
      }
      ondblclick={
        !isAdmin()
          ? undefined
          : async () => {
              if (!props.editDialog) return;
              const dResult =
                await props.editDialog.ShowModal<CreateEditMemberDialogResult>(
                  members.entities[props.id],
                );
              if (dResult.result === "Cancel") return;

              await Executor.run(
                () =>
                  API.Members.update({
                    original: members.entities[props.id],
                    changes: detectChanges(
                      members.entities[props.id],
                      dResult.member,
                    ),
                  }),
                { busyDialogMessage: "Updating member..." },
              );
            }
      }
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

      <Show when={isAdmin() && members.entities[props.id]?.isSelected}>
        <Row class={"item-selected-marker"}>
          <Tick />
        </Row>
      </Show>
    </Row>
  );
}
