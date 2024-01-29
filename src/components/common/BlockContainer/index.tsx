import "./index.css";
import { createEffect, JSX, on, Show } from "solid-js";
import Button from "~/components/common/Button";
import Delete from "~/assets/icons/Delete";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Add from "~/assets/icons/Add";

type BlockContainerProps = {
  title: string;
  titleIcon?: JSX.Element;
  children: JSX.Element | JSX.Element[];
  class?: string;
  style?: string | JSX.CSSProperties;
  onAddNewItem?: () => void;
  onDeleteSelectedItems?: () => void;
};

export default function (props: BlockContainerProps) {
  let titleRef: HTMLDivElement;

  createEffect(
    on(
      () => props.title,
      async (title) => {
        await titleRef.animate({ opacity: [1, 0] }, { duration: 500 }).finished;
        titleRef.innerText = title;
        titleRef.animate({ opacity: [0, 1] }, { duration: 500 });
      },
    ),
  );

  return (
    <Column
      class={`block-container${props.class ? " " + props.class : ""}`}
      style={props.style}
    >
      <Row class={"title-container"}>
        <Row class={"title"} ref={(el) => (titleRef = el)}>
          {""}
        </Row>
        <Show when={props.titleIcon}>{props.titleIcon}</Show>
        <Row class={"flex-1"}>{""}</Row>
        <Show when={props.onDeleteSelectedItems}>
          <Button
            style={{ height: "40px", width: "40px", padding: "0.25rem" }}
            onClick={props.onDeleteSelectedItems}
          >
            <Delete />
          </Button>
        </Show>
        <Show when={props.onAddNewItem}>
          <Button
            style={{ height: "40px", width: "40px", padding: "0.25rem" }}
            onClick={props.onAddNewItem}
          >
            <Add />
          </Button>
        </Show>
      </Row>
      {props.children}
    </Column>
  );
}
