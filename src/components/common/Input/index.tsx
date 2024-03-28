import styles from "./index.module.scss";
import { JSX, Show, splitProps } from "solid-js";

type Props = {
  label?: string;
  icon?: (props: any) => JSX.Element;
  height?: string | number;
  width?: "auto" | "full" | "half" | "third" | "quarter" | "screen";
} & JSX.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  const [local, rest] = splitProps(props, [
    "label",
    "class",
    "icon",
    "height",
    "width",
  ]);

  return (
    <div
      classList={{
        [styles.Input]: true,
        [styles[`w-${local.width}`]]: local.width !== undefined,
        [local.class || ""]: true,
      }}
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
