import { batch, createEffect, createSignal, JSX } from "solid-js";

type FacebookProps = {
  postHtml: string;
  width?: number;
  height?: number;
  style?: JSX.CSSProperties;
  scrolling?: "yes" | "no" | "auto";
};

export default function FacebookPost(props: FacebookProps) {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  const [frame, setFrame] = createSignal<HTMLIFrameElement>(null!);

  createEffect(() => {
    batch(() => {
      console.log("FacebookPost Dom update 0 ");
      if (props.postHtml.indexOf("facebook.com") === -1) {
        setFrame(null!);
        return;
      }

      console.log("FacebookPost Dom update 1 ");

      // By default, it has to be an iframe
      let dom = parser.parseFromString(props.postHtml, "text/html");

      console.log("FacebookPost Dom update 2");

      // Adjust the width of the iframe
      if (dom.body.firstChild instanceof HTMLIFrameElement) {
        console.log("FacebookPost Dom update iframe ");

        if (dom.body.firstChild.width !== `${props.width}`) {
          dom.body.firstChild.width = `${props.width}`;
          const updatedHtml = serializer.serializeToString(dom.body.firstChild);
          dom = parser.parseFromString(updatedHtml, "text/html");
        }

        setFrame(dom.body.firstChild as HTMLIFrameElement);
        return;
      }

      console.log("FacebookPost Dom update 3");

      if (dom.body.firstChild instanceof HTMLDivElement) {
        console.log("FacebookPost Dom update HTMLDivElement");
        const frame = (
          <iframe
            width={props.width}
            height={props.height}
            // @ts-ignore
            scrolling={"no"}
            srcdoc={
              props.postHtml +
              ` <script async defer crossOrigin="anonymous" nonce="AaQrMFZx" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"/>`
            }
            style={{
              width: `${props.width}px`,
              height: `${props.height}px`,
              ...props.style,
            }}
          />
        );
        setFrame(frame as HTMLIFrameElement);
      }
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
