import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

type ScrollableProps = {
  children: JSX.Element | JSX.Element[];
  direction?: "vertical" | "horizontal";
  hideScrollbar?: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function Scrollable(props: ScrollableProps) {
  const [local, rest] = splitProps(props, [
    "children",
    "direction",
    "hideScrollbar",
    "class",
  ]);

  return (
    <div
      classList={{
        [styles.Scrollable]: true,
        [styles[local.direction || "vertical"]]: true,
        [styles.hideScrollbar]: local.hideScrollbar || false,
        [local.class || ""]: true,
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
}
