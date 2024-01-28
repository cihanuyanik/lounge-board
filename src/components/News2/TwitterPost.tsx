import { createEffect, JSX, Show } from "solid-js";

type TwitterPostProps = {
  postHtml: string;
  width?: number;
  height?: number;
  style?: JSX.CSSProperties;
  scrolling?: "yes" | "no" | "auto";
};

export default function TwitterPost(props: TwitterPostProps) {
  let frame: HTMLIFrameElement = null!;

  createEffect(() => {
    if (props.scrolling) {
      if (frame) {
        frame.scrolling = props.scrolling;
      }
    }
  });

  return (
    <Show when={props.postHtml.indexOf("twitter.com") !== -1} fallback={null}>
      <iframe
        ref={frame}
        width={props.width}
        height={props.height}
        srcdoc={props.postHtml}
        style={{
          width: `${props.width}px`,
          height: `${props.height}px`,
          "min-height": `${props.height}px`,
          "max-height": `${props.height}px`,
          ...props.style,
        }}
      ></iframe>
    </Show>
  );
}
