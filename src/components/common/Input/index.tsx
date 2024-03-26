import styles from "./index.module.scss";
import { JSX, Show, splitProps } from "solid-js";

type Props = {
  label?: string;
  icon?: (props: any) => JSX.Element;
  height?: string | number;
} & JSX.InputHTMLAttributes<HTMLInputElement>;

export default function (props: Props) {
  const [local, rest] = splitProps(props, ["label", "class", "icon", "height"]);

  return (
    <div
      class={`${styles.Input}${local.class ? " " + local.class : ""}`}
      style={{
        "--label-height": local.label ? "26px" : "0px",
        "--container-height": local.height ? `${local.height}px` : "70px",
      }}
    >
      <input {...rest} />
      <Show when={local.label}>
        <label>{local.label}</label>
      </Show>
      <Show when={local.icon}>{local.icon}</Show>
    </div>
  );
}
