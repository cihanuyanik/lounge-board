import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

export default function Img(props: JSX.ImgHTMLAttributes<HTMLImageElement>) {
  const [local, rest] = splitProps(props, ["class", "alt"]);

  return (
    <img
      classList={{
        [styles.Img]: true,
        [local.class || ""]: true,
      }}
      alt={local.alt}
      {...rest}
    />
  );
}
