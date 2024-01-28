import Column from "~/components/common/Column";
import { createMemo, JSX, splitProps } from "solid-js";

type Props = {
  title?: string;
  src: string;
  minHeight: string | number;
  class?: string;
  containerStyle?: JSX.CSSProperties;
  frameStyle?: JSX.CSSProperties;
  scrolling?: "yes" | "no" | "auto";
} & JSX.IframeHTMLAttributes<HTMLIFrameElement>;

export default function (props: Props) {
  const [local, rest] = splitProps(props, [
    "title",
    "src",
    "minHeight",
    "class",
    "containerStyle",
    "frameStyle",
  ]);

  let frame: HTMLIFrameElement = null!;
  let frameContainer: HTMLDivElement = null!;

  const minHeight = createMemo(() => {
    return typeof local.minHeight === "number"
      ? `${local.minHeight}px`
      : local.minHeight;
  });

  return (
    <Column
      ref={frameContainer}
      class={local.class}
      style={{
        height: minHeight(),
        "min-height": minHeight(),
        ...local.containerStyle,
      }}
    >
      <iframe
        ref={frame}
        src={local.src}
        style={{
          flex: "1",
          width: "100%",
          ...local.frameStyle,
        }}
        title={local.title || "Embedded post"}
        {...rest}
      />
    </Column>
  );
}
