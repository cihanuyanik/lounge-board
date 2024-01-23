import "./index.scss";
import { JSX, splitProps } from "solid-js";

export default function (props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["children", "class"]);

  return (
    <div class={`column${local.class ? " " + local.class : ""}`} {...rest}>
      {local.children}
    </div>
  );
}
