import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

type ScrollableProps = {
  children: JSX.Element | JSX.Element[];
  direction?: "vertical" | "horizontal";
  hideScrollbar?: boolean;
  as?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function Scrollable(props: ScrollableProps) {
  const [local, rest] = splitProps(props, [
    "children",
    "direction",
    "hideScrollbar",
    "class",
    "classList",
    "as",
  ]);

  return (
    <Dynamic
      component={local.as || "div"}
      classList={{
        [styles.Scrollable]: true,
        [styles[local.direction || "vertical"]]: true,
        [styles.hideScrollbar]: local.hideScrollbar || false,
        [local.class || ""]: true,
        ...local.classList,
      }}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
}
