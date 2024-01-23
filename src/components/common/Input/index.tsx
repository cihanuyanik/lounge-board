import "./index.scss";
import { JSX, Show, splitProps } from "solid-js";

type Props = {
  label: string;
  icon?: (props: any) => JSX.Element;
} & JSX.InputHTMLAttributes<HTMLInputElement>;

export default function (props: Props) {
  const [local, rest] = splitProps(props, ["label", "class", "icon"]);
  return (
    <div class={`input-container${local.class ? " " + local.class : ""}`}>
      <input {...rest} />
      <label>{local.label}</label>
      <Show when={local.icon}>{local.icon}</Show>
    </div>
  );
}
