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
  as?: string;
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
  return (
    <Column
      ref={props.ref}
      as={props.as || "block-container"}
      classList={{
        [styles.BlockContainer]: true,
        [props.class || ""]: true,
      }}
      style={props.style}
    >
      <Row as={"title-block"} class={styles.titleContainer}>
        <TitleText title={props.title} />
        <TitleIcon titleIcon={props.titleIcon} />
        <Actions
          onAddNewItem={props.onAddNewItem}
          onDeleteSelectedItems={props.onDeleteSelectedItems}
          popupDirection={props.popupDirection}
        />
      </Row>
      {props.children}
    </Column>
  );
}

function TitleText(props: { title: string }) {
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

  let titleRef: HTMLDivElement = null!;

  return (
    <Row as={"title-text"} class={styles.title} ref={titleRef!}>
      {""}
    </Row>
  );
}

function TitleIcon(props: { titleIcon?: string | JSX.Element }) {
  return (
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
  );
}

function Actions(props: {
  onAddNewItem?: () => void;
  onDeleteSelectedItems?: () => void;
  popupDirection?: Direction;
}) {
  return (
    <Show when={props.onAddNewItem || props.onDeleteSelectedItems}>
      <Row as={"action-buttons"} flex={"1"} justifyContent={"end"} gap={"2"}>
        <Button
          class={styles.actionBtn}
          popupContent={"Delete selected items from this block"}
          popupDirection={props.popupDirection}
          onClick={props.onDeleteSelectedItems}
        >
          <Delete />
        </Button>
        <Button
          class={styles.actionBtn}
          popupContent={"Add new item to this block"}
          popupDirection={props.popupDirection}
          onClick={props.onAddNewItem}
        >
          <Add />
        </Button>
      </Row>
    </Show>
  );
}
