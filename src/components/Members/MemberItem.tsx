import styles from "./members.module.scss";
import DragHandle from "~/components/DragToReorder/DragHandle";
import { Show } from "solid-js";
import Row from "~/components/common/Flex/Row";
import Column from "~/components/common/Flex/Column";
import { useAppContext } from "~/AppContext";
import Avatar from "~/components/common/Avatar";
import SelectedMarker from "~/components/SelectedMarker";

type MemberItemProps = {
  id: string;
  editDialog: HTMLDialogElement;
};

export default function MemberItem(props: MemberItemProps) {
  const { isAdmin, members } = useAppContext();

  return (
    <Row
      id={props.id}
      class={styles.memberItem}
      classList={{
        "drag-item": isAdmin(),
        [styles.pointer]: isAdmin(),
        [styles.selected]: members.entities[props.id]?.isSelected,
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
          : () => props.editDialog.ShowModal(members.entities[props.id])
      }
    >
      <Avatar imgSrc={members.entities[props.id]?.image} />

      <Column class={styles.nrContainer}>
        <Row class={styles.name}>{members.entities[props.id]?.name}</Row>
        <Row class={styles.role}>{members.entities[props.id]?.role}</Row>
      </Column>

      <Show when={isAdmin()}>
        <DragHandle />
        <SelectedMarker visible={members.entities[props.id]?.isSelected} />
      </Show>
    </Row>
  );
}
