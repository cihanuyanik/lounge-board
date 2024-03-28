import styles from "./index.module.scss";
import { createEffect, JSX, Match, on, Show, Switch } from "solid-js";
import Button from "~/components/common/Button";
import Delete from "~/assets/icons/Delete";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import Add from "~/assets/icons/Add";
import Img from "~/components/common/Img";
import { Direction } from "~/components/common/HoverPopup";

type BlockContainerProps = {
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
  title: string;
  titleIcon?: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
  class?: string;
  style?: string | JSX.CSSProperties;
  onAddNewItem?: () => void;
  onDeleteSelectedItems?: () => void;
  popupDirection?: Direction;
};

export default function BlockContainer(props: BlockContainerProps) {
  let titleRef: HTMLDivElement = null!;

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
      ref={props.ref}
      classList={{
        [styles.BlockContainer]: true,
        [props.class || ""]: true,
      }}
      style={props.style}
    >
      <Row class={styles.titleContainer}>
        <Row class={styles.title} ref={titleRef!}>
          {""}
        </Row>
        <Show when={props.titleIcon}>
          <Switch>
            <Match when={typeof props.titleIcon === "string"}>
              <Img src={props.titleIcon as string} />
            </Match>
            <Match when={typeof props.titleIcon === "function"}>
              {props.titleIcon}
            </Match>
          </Switch>
        </Show>
        <Row flex={"1"}>{""}</Row>
        <Show when={props.onDeleteSelectedItems}>
          <Button
            class={styles.actionBtn}
            popupContent={"Delete selected items from this block"}
            popupDirection={props.popupDirection}
            onClick={props.onDeleteSelectedItems}
          >
            <Delete />
          </Button>
        </Show>
        <Show when={props.onAddNewItem}>
          <Button
            class={styles.actionBtn}
            popupContent={"Add new item to this block"}
            popupDirection={props.popupDirection}
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
