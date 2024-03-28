import styles from "./index.module.scss";
import { batch, createSignal, JSX, onMount } from "solid-js";
import Row from "~/components/common/Flex/Row";

export type Direction =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type HoverPopupRef = {
  show: (x: number, y: number) => void;
  close: () => void;
};

type HoverPopupProps = {
  ref: (el: HoverPopupRef) => void;
  children?: JSX.Element;
  direction: Direction;
};

export default function HoverPopup(props: HoverPopupProps) {
  const [popupOpen, setPopupOpen] = createSignal(false);
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);

  onMount(() => {
    // Create ref object and pass it to parent via props.ref(...)
    const refObject = {
      show(x: number, y: number) {
        batch(() => {
          setX(x);
          setY(y);
          setPopupOpen(true);
        });
      },
      close() {
        setPopupOpen(false);
      },
    };

    props.ref(refObject);
  });

  return (
    <Row
      classList={{
        [styles.HoverPopup]: true,
        [styles[props.direction]]: true,
        [styles.open]: popupOpen(),
      }}
      style={{
        top: `${y()}px`,
        left: `${x()}px`,
      }}
    >
      {props.children}
    </Row>
  );
}
