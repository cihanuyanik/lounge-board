import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

export default function Img(props: JSX.ImgHTMLAttributes<HTMLImageElement>) {
  const [local, rest] = splitProps(props, ["class", "alt"]);

  return (
    <img
      class={`${styles.Img}${local.class ? " " + local.class : ""}`}
      alt={local.alt}
      {...rest}
    />
  );
}
