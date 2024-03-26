import styles from "./index.module.scss";
import {
  Accessor,
  createEffect,
  createSignal,
  JSX,
  on,
  onCleanup,
} from "solid-js";
import { waitUntil } from "~/utils/utils";

type DropDownItemProps = {
  value: string;
  children: JSX.Element;
  onClick?: () => void;
};

type Props = {
  class?: string;
  rootStyle?: JSX.CSSProperties;
  children: JSX.Element | JSX.Element[];
  value: string;
  onValueChanged: (event: { value: string; target: HTMLDivElement }) => void;
};

export default function (props: Props) {
  const [open, setOpen] = createSignal(false);
  const [dropdownMenu, setDropdownMenu] = createSignal<HTMLDivElement>(null!);
  const [valueVisual, setValueVisual] = createSignal<HTMLElement>(null!);

  createEffect(
    on(
      [() => props.value, () => dropdownMenu()],
      ({ 0: newValue, 1: dropdownMenu }) => {
        if (!newValue) {
          setValueVisual(null!);
          return;
        }
        if (!dropdownMenu) {
          setValueVisual(null!);
          return;
        }

        // There is a chance that the items are not yet rendered, waiting for the next tick
        waitUntil(() => dropdownMenu.children.length > 0, 50, 500).then(() => {
          const items = dropdownMenu.querySelectorAll(`.${styles.item}`);

          if (!items || items.length === 0) {
            setValueVisual(null!);
            return;
          }

          for (const item of items) {
            if (item.id === newValue) {
              setValueVisual(item.cloneNode(true) as HTMLDivElement);
              return;
            }
          }

          setValueVisual(null!);
          return;
        });
      },
    ),
  );

  const unSubList: Unsubscribe[] = [];

  onCleanup(() => {
    unSubList.forEach((unSub) => unSub());
    unSubList.slice(0, unSubList.length);
  });

  // noinspection HtmlUnknownAttribute
  return (
    <div
      class={`${styles.Dropdown}${props.class ? " " + props.class : ""}`}
      onClick={() => setOpen((prev) => !prev)}
      style={props.rootStyle}
      // @ts-ignore
      use:clickOutside={() => setOpen(false)}
    >
      <div class={styles.toggle}>{valueVisual()}</div>
      <div class={styles.arrow} classList={{ [styles.rotate]: open() }}>
        <p>▼</p>
      </div>
      <div
        ref={(el) => {
          setDropdownMenu(el);
          if (el) {
            unSubList.push(
              el.registerEventListener("item-click", (e: CustomEvent) => {
                const newValue = e.detail.value as string;
                if (props.value !== newValue) {
                  props.onValueChanged?.({
                    value: e.detail.value as string,
                    target: e.detail.source as HTMLDivElement,
                  });
                }
              }),
            );
          }
        }}
        class={styles.menu}
        classList={{ [styles.open]: open() }}
      >
        {props.children}
      </div>
    </div>
  );
}

export function DropdownItem(props: DropDownItemProps) {
  return (
    <div
      id={props.value}
      class={styles.item}
      onClick={(e) => {
        // Access parent menu div
        const menuNode = e.target.parentNode as HTMLDivElement;
        if (menuNode.classList.contains(styles.menu)) {
          menuNode.dispatchEvent(
            new CustomEvent("item-click", {
              detail: { value: props.value, source: e.target },
            }),
          );
        }
      }}
    >
      {props.children}
    </div>
  );
}

// noinspection JSUnusedLocalSymbols
const clickOutside = (el: any, accessor: Accessor<() => void>): void => {
  const onClick = (e: MouseEvent) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
};
