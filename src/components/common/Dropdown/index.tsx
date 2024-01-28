import "./index.scss";
import {
  Accessor,
  batch,
  children,
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  onCleanup,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

type DropDownItemProps = {
  value: string;
  children: JSX.Element;
  onClick?: () => void;
};

export function DropdownItem(props: DropDownItemProps) {
  return (
    <div class={"item"} onClick={props.onClick} data-value={props.value}>
      {props.children}
    </div>
  );
}

type Props = {
  class?: string;
  rootStyle?: JSX.CSSProperties;
  children: JSX.Element | JSX.Element[];
  value?: string;
  onValueChanged?: (event: { value: string; target: HTMLDivElement }) => void;
};

export default function (props: Props) {
  const [open, setOpen] = createSignal(false);
  const [value, setValue] = createSignal(props.value || "");
  // const items = children(() => props.children).toArray();
  const [itemMap, setItemMap] = createSignal<Record<string, HTMLDivElement>>(
    {},
  );

  const items = createMemo(() => {
    return children(() => props.children).toArray();
  });

  createEffect(() => {
    // Handles the case when the value is driven by external prop value
    setValue(props.value || "");
  });

  createEffect(() => {
    const itemMap: Record<string, HTMLDivElement> = {};

    items().forEach((item) => {
      if (item instanceof HTMLDivElement && item.dataset.value) {
        item.onclick = () => {
          const newValue = item.dataset.value as string;
          props.onValueChanged?.({ value: newValue, target: item });
          if (value() !== newValue) {
            setValue(newValue);
          }
        };
        itemMap[item.dataset.value] = item;
      }
    });

    setItemMap(itemMap);
  });

  return (
    <div
      class={`dropdown${props.class ? " " + props.class : ""}`}
      onClick={() => setOpen((prev) => !prev)}
      style={props.rootStyle}
      // @ts-ignore
      use:clickOutside={() => setOpen(false)}
    >
      <div class={"toggle"}>{itemMap()[value()]?.cloneNode(true)}</div>
      <div class={"arrow"} classList={{ rotate: open() }}>
        <p>▼</p>
      </div>
      <div class={`menu${open() ? " open" : ""}`}>{items()}</div>
    </div>
  );
}

function clickOutside(el: any, accessor: Accessor<() => void>) {
  const onClick = (e: MouseEvent) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
