import styles from "./index.module.scss";
import { JSX, Show, splitProps } from "solid-js";
import HoverPopup, {
  Direction,
  HoverPopupRef,
} from "~/components/common/HoverPopup";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  popupContent?: JSX.Element;
  popupDelay?: number;
  popupDirection?: Direction;
  rectangle?: boolean;
};

export default function Button(props: ButtonProps) {
  // Split props into local and rest
  const [local, rest] = splitProps(props, [
    "class",
    "classList",
    "popupContent",
    "popupDelay",
    "popupDirection",
    "rectangle",
  ]);

  function popupPointerEnter(e: PointerEvent & { currentTarget: HTMLElement }) {
    const button = e.target as HTMLButtonElement;
    const removeEvent = button.registerEventListener("pointerleave", () => {
      // Cancel started popup timer
      clearTimeout(popupTimer);
      // Close popup, this has no effect if it is not open
      popup.close();
      // Remove pointer leave event handler
      removeEvent();
    });

    // Show popup after if the user is still hovering after some time
    const popupTimer = setTimeout(() => {
      // Get target position with respect to body
      const targetRect = button.getBoundingClientRect();

      let x = targetRect.width;
      if (local.popupDirection && local.popupDirection.endsWith("left")) x = 0;

      let y = targetRect.height;
      if (local.popupDirection && local.popupDirection.startsWith("top")) y = 0;

      popup.show(x, y);
    }, local.popupDelay || 500);
  }

  let popup: HoverPopupRef;

  return (
    <button
      onPointerEnter={local.popupContent ? popupPointerEnter : undefined}
      classList={{
        [styles.Button]: true,
        [styles.rectangle]: local.rectangle || false,
        [local.class!]: local.class !== undefined,
        ...local.classList,
      }}
      {...rest}
    >
      {props.children}
      <Show when={local.popupContent}>
        <HoverPopup
          ref={(el) => (popup = el)}
          direction={local.popupDirection || "bottom-right"}
        >
          {local.popupContent}
        </HoverPopup>
      </Show>
    </button>
  );
}
