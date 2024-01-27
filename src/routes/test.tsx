"use client";
import { createSignal, onCleanup, onMount } from "solid-js";
import { AppContextProvider, useAppContext } from "~/AppContext";
import { isServer } from "solid-js/web";
import MessageBox from "~/components/MessageBox";
import { scrollBottomAnimation, sleep } from "~/utils/utils";
import Row from "~/components/common/Row";
import Column from "~/components/common/Column";
import Scrollable from "~/components/common/Scrollable";

type TestProps = {};

export default function Test(props: TestProps) {
  return (
    <AppContextProvider>
      <_Test {...props} />
    </AppContextProvider>
  );
}

function _Test(props: TestProps) {
  return (
    <Row>
      <SociablekitAutoScrollFrame
        url={
          "https://widgets.sociablekit.com/linkedin-page-posts/iframe/25354398"
        }
      />
      <SociablekitAutoScrollFrame
        url={
          "https://widgets.sociablekit.com/linkedin-profile-posts/iframe/25354425"
        }
      />
    </Row>
  );
}

function SociablekitAutoScrollFrame(props: { url: string }) {
  let timeOut: any;
  let frameContainer: HTMLDivElement = null!;
  let frame: HTMLIFrameElement = null!;

  async function scroll() {
    if (frameContainer) {
      frameContainer.scrollTop = 0;
      let scrollStepAmount = 2;
      let scrollAmount =
        frameContainer.scrollHeight - frameContainer.clientHeight;

      let microStepDurationMs = 50;

      while (scrollAmount > 0) {
        if (scrollAmount < scrollStepAmount) scrollStepAmount = scrollAmount;
        frameContainer.scrollTop += scrollStepAmount;
        scrollAmount -= scrollStepAmount;
        await sleep(microStepDurationMs);
      }
    }
    await sleep(2000);
    // Refresh the iframe page, so that updated posts are shown
    frame.src = props.url;
    timeOut = setTimeout(scroll, 2000);
  }

  onMount(() => {
    // if (isAdmin()) return;
    timeOut = setTimeout(scroll, 5000);
  });

  onCleanup(() => clearTimeout(timeOut));

  return (
    <Scrollable
      direction={"vertical"}
      hideScrollbar={true}
      ref={frameContainer}
      style={{
        height: "500px",
        width: "500px",
      }}
    >
      <iframe
        ref={frame}
        src={props.url}
        style={{
          width: "calc(100% + 10px)",
          height: "1000%",
          "margin-right": "-10px",
        }}
      ></iframe>
    </Scrollable>
  );
}
