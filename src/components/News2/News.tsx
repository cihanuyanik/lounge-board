import "./news.scss";
import BlockContainer from "~/components/common/BlockContainer";
import Img from "~/components/common/Img";
import NewsHeader from "~/assets/images/news-header.png";
import Scrollable from "~/components/common/Scrollable";
import { onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";

type NewsProps = {};

export default function News(props: NewsProps) {
  const icon = <Img src={NewsHeader} style={{ height: "35px" }} />;

  let newsRef: HTMLDivElement = null!;

  const offset = 230;

  return (
    <BlockContainer title={"News"} titleIcon={icon} class={"flex-1 w-full"}>
      <Scrollable
        ref={newsRef}
        direction={"vertical"}
        hideScrollbar={true}
        // class={"flex-1 w-full"}
        class={"news-container"}
      >
        <IFrame
          src={
            "https://www.linkedin.com/embed/feed/update/urn:li:share:7154078908080889857"
          }
          minHeight={`${653 - offset}px`}
        />
        <IFrame
          src={
            "https://www.linkedin.com/embed/feed/update/urn:li:activity:7155831647811076096"
          }
          minHeight={`${1212 - offset}px`}
        />

        <IFrame
          src={
            "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7153016155866116098"
          }
          minHeight={`${1044 - offset}px`}
        />

        {/*<IFrame />*/}
      </Scrollable>
    </BlockContainer>
  );
}

function IFrame(props: { src: string; minHeight: string }) {
  let frame: HTMLIFrameElement = null!;
  let frameContainer: HTMLDivElement = null!;

  let frameContainerSizeObserver: ResizeObserver = null!;

  onMount(() => {
    if (isServer) {
    } else {
      onMountClient();
    }
  });

  onCleanup(() => {
    frameContainerSizeObserver?.unobserve(frameContainer);
  });

  function onMountClient() {
    frameContainerSizeObserver = new ResizeObserver(async (entries) => {
      const containerRect = entries[0].contentRect;
      console.log(containerRect.width, containerRect.height);
    });

    frameContainerSizeObserver.observe(frameContainer);
  }

  return (
    <div
      ref={frameContainer}
      style={{
        width: "100%",
        "min-height": props.minHeight,
      }}
    >
      <iframe
        ref={frame}
        // onLoad={(ev) => {
        //   console.log(frame.clientWidth);
        // }}
        src={props.src}
        height="100%"
        width="100%"
        title="Embedded post"
      ></iframe>
    </div>
  );
}
