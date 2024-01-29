import "./index.css";
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
      class={`scrollable ${local.direction}${local.class ? " " + local.class : ""}`}
      classList={{ "hide-scrollbar": local.hideScrollbar === true }}
      {...rest}
    >
      {local.children}
    </div>
  );
}
