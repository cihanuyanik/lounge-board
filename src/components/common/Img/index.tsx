import "./index.scss";
import { JSX, splitProps } from "solid-js";

export default function (props: JSX.ImgHTMLAttributes<HTMLImageElement>) {
  const [local, rest] = splitProps(props, ["class", "alt"]);

  return (
    <img
      class={`image-base${local.class ? " " + local.class : ""}`}
      alt={local.alt}
      {...rest}
    />
  );
}
