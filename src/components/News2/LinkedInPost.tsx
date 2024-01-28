import { batch, createEffect, createMemo, createSignal, JSX } from "solid-js";

type LinkedInPostProps = {
  postHtml: string;
  width?: number;
  height?: number;
  style?: JSX.CSSProperties;
  scrolling?: "yes" | "no" | "auto";
};

export default function LinkedInPost(props: LinkedInPostProps) {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  const [frame, setFrame] = createSignal<HTMLIFrameElement>(null!);

  createEffect(() => {
    batch(() => {
      if (props.postHtml.indexOf("linkedin.com") === -1) {
        setFrame(null!);
        return;
      }

      let dom = parser.parseFromString(props.postHtml, "text/html");

      // By default, it has to be an iframe
      if (!(dom.body.firstChild instanceof HTMLIFrameElement)) {
        setFrame(null!);
        return;
      }

      // Adjust the width of the iframe
      if (dom.body.firstChild.width !== `${props.width}`) {
        dom.body.firstChild.width = `${props.width}`;
        const updatedHtml = serializer.serializeToString(dom.body.firstChild);
        dom = parser.parseFromString(updatedHtml, "text/html");
      }

      setFrame(dom.body.firstChild as HTMLIFrameElement);
    });
  });

  createEffect(() => {
    if (props.scrolling) {
      if (frame()) {
        frame().scrolling = props.scrolling;
      }
    }
  });

  createEffect(() => {
    // Handle width update
    if (!frame()) return;
    if (props.style === undefined) return;

    // Iterate through all the keys in the style object
    Object.keys(props.style).forEach((key) => {
      // @ts-ignore
      frame().style[key] = props.style[key];
    });
  });

  createEffect(() => {
    // Handle height update
    if (!frame()) return;
    frame().style.height = `${props.height}px`;
    frame().style.minHeight = `${props.height}px`;
    frame().style.maxHeight = `${props.height}px`;
  });

  return <>{frame()}</>;
}
