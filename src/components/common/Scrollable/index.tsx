import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

type ScrollableProps = {
  children: JSX.Element | JSX.Element[];
  direction: "vertical" | "horizontal";
  hideScrollbar?: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function (props: ScrollableProps) {
  const [local, rest] = splitProps(props, [
    "children",
    "direction",
    "hideScrollbar",
    "class",
  ]);

  return (
    <div
      class={`${styles.Scrollable} ${styles[local.direction]}`}
      classList={{
        [styles.hideScrollbar]: local.hideScrollbar || false,
        [local.class!]: local.class !== undefined,
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
}
