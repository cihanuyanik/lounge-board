import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

export default function (props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["children", "class"]);

  return (
    <div
      class={`${styles.Column}${local.class ? " " + local.class : ""}`}
      {...rest}
    >
      {local.children}
    </div>
  );
}
