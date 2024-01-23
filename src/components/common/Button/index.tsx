import "./index.scss";
import { JSX, splitProps } from "solid-js";

export default function (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  // Split props into local and rest
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <button
      class={`button-base${local.class ? " " + local.class : ""}`}
      {...rest}
    >
      {props.children}
    </button>
  );
}
