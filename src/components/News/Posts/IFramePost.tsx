import { createMemo, JSX, on, Show } from "solid-js";

export type IFramePostProps = {
  baseUrl: string;
  postHtml: string;
  expInternalType: "iframe" | "blockquote";
  width: number;
  height: number;
  ref?: HTMLIFrameElement | ((el: HTMLIFrameElement) => void);
  style?: JSX.CSSProperties;
  scrolling?: "yes" | "no" | "auto";
};

export default function IFramePost(props: IFramePostProps) {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  // Only triggered when postHtml changes
  const iframeAttributesFromPostHtml = createMemo(
    on(
      [() => props.postHtml, () => props.baseUrl, () => props.expInternalType],
      ({ 0: postHtml, 1: baseUrl, 2: expInternalType }) => {
        if (postHtml === undefined) return null;

        if (postHtml.indexOf(baseUrl) === -1) {
          return null;
        }

        // First child should be an iframe
        if (expInternalType === "iframe" && postHtml.startsWith("<iframe")) {
          // Parse postHtml
          let dom = parser.parseFromString(postHtml, "text/html");

          // First child should be an iframe
          let iframe = dom.body.firstChild as HTMLIFrameElement;

          // Adjust the width of the iframe
          if (iframe.width !== `${props.width}`) {
            iframe.width = `${props.width}`;
            const updatedHtml = serializer.serializeToString(iframe);
            dom = parser.parseFromString(updatedHtml, "text/html");
            iframe = dom.body.firstChild as HTMLIFrameElement;
          }

          // const iframe = dom.body.firstChild as HTMLIFrameElement;
          // Copy attributes by iterating over iframe attributes
          const attributes = {} as Record<string, string>;
          for (const attrName of iframe.getAttributeNames()) {
            // skip width and height, they are handled separately
            if (attrName === "width" || attrName === "height") continue;
            attributes[attrName] = iframe.getAttribute(attrName)!;
          }

          // check whether attributes is empty or not
          if (Object.keys(attributes).length === 0) return null;

          return attributes;
        }

        if (
          expInternalType === "blockquote" &&
          postHtml.startsWith("<blockquote")
        ) {
          // Only necessary attribute is srcdoc
          return { srcdoc: postHtml };
        }

        return null;
      },
    ),
  );

  return (
    <Show when={iframeAttributesFromPostHtml() !== null} fallback={null}>
      <iframe
        ref={props.ref}
        {...iframeAttributesFromPostHtml()}
        style={{
          overflow: props.scrolling === "no" ? "hidden" : "auto",
          "min-width": `${props.width}px`,
          "max-width": `${props.width}px`,
          "min-height": `${props.height}px`,
          "max-height": `${props.height}px`,
          ...props.style,
        }}
      />
    </Show>
  );
}
