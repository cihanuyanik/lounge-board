import styles from "./index.module.scss";
import CenterIcon from "~/assets/icons/CenterIcon";
import ResizeIcon from "~/assets/icons/ResizeIcon";
import { createEffect, Show } from "solid-js";
import Row from "~/components/common/Row";
import { useDialogContext } from "~/components/ImageCropDialog/index";

export function CropBox(props: { ref: (el: HTMLDivElement) => void }) {
  const { state } = useDialogContext();
  if (state === undefined) return;

  createEffect(() => {
    if (state.rounded === "none") {
      cropBoxRef.style.borderRadius = "0";
    } else if (state.rounded === "full") {
      cropBoxRef.style.borderTopLeftRadius = "50% 50%";
      cropBoxRef.style.borderTopRightRadius = "50% 50%";
      cropBoxRef.style.borderBottomLeftRadius = "50% 50%";
      cropBoxRef.style.borderBottomRightRadius = "50% 50%";
    } else if (typeof state.rounded === "number") {
      cropBoxRef.style.borderRadius = `${state.rounded}px`;
    }
  });

  let cropBoxRef: HTMLDivElement;

  return (
    <>
      <Row
        ref={(el) => {
          props.ref(el);
          cropBoxRef = el;
        }}
        class={styles.cropbox}
        style={{
          top: `${state.cropRegion?.y}px`,
          left: `${state.cropRegion?.x}px`,
          width: `${state.cropRegion?.width}px`,
          height: `${state.cropRegion?.height}px`,
        }}
      >
        <Center />
        <TopCenter />
        <RightCenter />
        <BottomCenter />
        <LeftCenter />
        <Show when={state.aspectRatio === undefined}>
          <TopLeft />
          <TopRight />
          <BottomRight />
          <BottomLeft />
        </Show>
      </Row>
    </>
  );
}

function Center() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      // Move the crop region by the same amount as the mouse
      state.cropRegion.x += e.movementX;
      state.cropRegion.y += e.movementY;

      // Check boundaries
      if (state.cropRegion.x < 0) state.cropRegion.x = 0;
      if (state.cropRegion.y < 0) state.cropRegion.y = 0;
      if (state.cropRegion.x + state.cropRegion.width > state.canvas.width)
        state.cropRegion.x = state.canvas.width - state.cropRegion.width;
      if (state.cropRegion.y + state.cropRegion.height > state.canvas.height)
        state.cropRegion.y = state.canvas.height - state.cropRegion.height;
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.center}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `${state.cropRegion.width / 2}px`,
        top: `${state.cropRegion.height / 2}px`,
      }}
    >
      <CenterIcon />
    </Row>
  );
}

function TopLeft() {
  const { mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      // Free aspect ratio
      // Move the crop region by the same amount as the mouse
      state.cropRegion.x += e.movementX;
      state.cropRegion.y += e.movementY;
      state.cropRegion.width -= e.movementX;
      state.cropRegion.height -= e.movementY;

      // Check boundaries
      if (state.cropRegion.x < 0) {
        state.cropRegion.width += state.cropRegion.x;
        state.cropRegion.x = 0;
      }
      if (state.cropRegion.y < 0) {
        state.cropRegion.height += state.cropRegion.y;
        state.cropRegion.y = 0;
      }
      if (state.cropRegion.width < 0) {
        state.cropRegion.x += state.cropRegion.width;
        state.cropRegion.width = 0;
      }
      if (state.cropRegion.height < 0) {
        state.cropRegion.y += state.cropRegion.height;
        state.cropRegion.height = 0;
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.topLeft}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `0px`,
        top: `0px`,
      }}
    >
      <ResizeIcon rotate={-45}></ResizeIcon>
    </Row>
  );
}

function TopCenter() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      if (state.aspectRatio === undefined) {
        // Move the crop region by the same amount as the mouse
        state.cropRegion.y += e.movementY;
        state.cropRegion.height -= e.movementY;

        // Check boundaries
        // noinspection DuplicatedCode
        if (state.cropRegion.y < 0) {
          state.cropRegion.height += state.cropRegion.y;
          state.cropRegion.y = 0;
        }
        if (state.cropRegion.height < 0) {
          state.cropRegion.y += state.cropRegion.height;
          state.cropRegion.height = 0;
        }
      }

      if (state.aspectRatio) {
        state.cropRegion.y += e.movementY;
        state.cropRegion.height -= e.movementY;

        const newWidth = state.cropRegion.height * state.aspectRatio;
        const widthDiff = newWidth - state.cropRegion.width;
        state.cropRegion.width = newWidth;
        state.cropRegion.x -= widthDiff / 2;

        // Check boundaries
        // noinspection DuplicatedCode
        if (state.cropRegion.y < 0) {
          state.cropRegion.height += state.cropRegion.y;
          state.cropRegion.y = 0;
        }
        if (state.cropRegion.height < 0) {
          state.cropRegion.y += state.cropRegion.height;
          state.cropRegion.height = 0;
        }
        // noinspection DuplicatedCode
        if (state.cropRegion.x < 0) {
          state.cropRegion.width += state.cropRegion.x;
          state.cropRegion.x = 0;
        }
        if (state.cropRegion.x + state.cropRegion.width > state.canvas.width) {
          state.cropRegion.width = state.canvas.width - state.cropRegion.x;
        }
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.topCenter}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `${state.cropRegion.width / 2}px`,
        top: `0px`,
      }}
    >
      <ResizeIcon rotate={0}></ResizeIcon>
    </Row>
  );
}

function TopRight() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      // Move the crop region by the same amount as the mouse
      state.cropRegion.y += e.movementY;
      state.cropRegion.width += e.movementX;
      state.cropRegion.height -= e.movementY;

      // Check boundaries
      if (state.cropRegion.y < 0) {
        state.cropRegion.height += state.cropRegion.y;
        state.cropRegion.y = 0;
      }
      if (state.cropRegion.width < 0) {
        // state.cropRegion.x += state.cropRegion.width;
        state.cropRegion.width = 0;
      }
      if (state.cropRegion.height < 0) {
        state.cropRegion.y += state.cropRegion.height;
        state.cropRegion.height = 0;
      }
      if (state.cropRegion.x + state.cropRegion.width > state.canvas.width) {
        state.cropRegion.width = state.canvas.width - state.cropRegion.x;
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.topRight}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `${state.cropRegion.width}px`,
        top: `0px`,
      }}
    >
      <ResizeIcon rotate={45}></ResizeIcon>
    </Row>
  );
}

function RightCenter() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      if (state.aspectRatio === undefined) {
        // Move the crop region by the same amount as the mouse
        state.cropRegion.width += e.movementX;

        // Check boundaries
        if (state.cropRegion.width < 0) {
          state.cropRegion.width = 0;
        }
        if (state.cropRegion.x + state.cropRegion.width > state.canvas.width) {
          state.cropRegion.width = state.canvas.width - state.cropRegion.x;
        }
      }

      if (state.aspectRatio) {
        state.cropRegion.width += e.movementX;

        const newHeight = state.cropRegion.width / state.aspectRatio;
        const heightDiff = newHeight - state.cropRegion.height;
        state.cropRegion.height = newHeight;
        state.cropRegion.y -= heightDiff / 2;

        // Check boundaries
        if (state.cropRegion.width < 0) {
          state.cropRegion.width = 0;
        }
        if (state.cropRegion.x + state.cropRegion.width > state.canvas.width) {
          state.cropRegion.width = state.canvas.width - state.cropRegion.x;
        }
        // noinspection DuplicatedCode
        if (state.cropRegion.y < 0) {
          state.cropRegion.height += state.cropRegion.y;
          state.cropRegion.y = 0;
        }
        if (
          state.cropRegion.y + state.cropRegion.height >
          state.canvas.height
        ) {
          state.cropRegion.height = state.canvas.height - state.cropRegion.y;
        }
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.rightCenter}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `${state.cropRegion.width}px`,
        top: `${state.cropRegion.height / 2}px`,
      }}
    >
      <ResizeIcon rotate={90}></ResizeIcon>
    </Row>
  );
}

function BottomRight() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      // Move the crop region by the same amount as the mouse
      state.cropRegion.width += e.movementX;
      state.cropRegion.height += e.movementY;

      // Check boundaries
      if (state.cropRegion.width < 0) {
        state.cropRegion.width = 0;
      }
      if (state.cropRegion.height < 0) {
        state.cropRegion.height = 0;
      }
      if (state.cropRegion.x + state.cropRegion.width > state.canvas.width) {
        state.cropRegion.width = state.canvas.width - state.cropRegion.x;
      }
      if (state.cropRegion.y + state.cropRegion.height > state.canvas.height) {
        state.cropRegion.height = state.canvas.height - state.cropRegion.y;
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.bottomRight}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `${state.cropRegion.width}px`,
        top: `${state.cropRegion.height}px`,
      }}
    >
      <ResizeIcon rotate={135}></ResizeIcon>
    </Row>
  );
}

function BottomCenter() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      if (state.aspectRatio === undefined) {
        // Move the crop region by the same amount as the mouse
        state.cropRegion.height += e.movementY;

        // Check boundaries
        if (state.cropRegion.height < 0) {
          state.cropRegion.height = 0;
        }
        if (
          state.cropRegion.y + state.cropRegion.height >
          state.canvas.height
        ) {
          state.cropRegion.height = state.canvas.height - state.cropRegion.y;
        }
      }

      if (state.aspectRatio) {
        state.cropRegion.height += e.movementY;

        const newWidth = state.cropRegion.height * state.aspectRatio;
        const widthDiff = newWidth - state.cropRegion.width;
        state.cropRegion.width = newWidth;
        state.cropRegion.x -= widthDiff / 2;

        // Check boundaries
        if (state.cropRegion.height < 0) {
          state.cropRegion.height = 0;
        }
        if (
          state.cropRegion.y + state.cropRegion.height >
          state.canvas.height
        ) {
          state.cropRegion.height = state.canvas.height - state.cropRegion.y;
        }
        // noinspection DuplicatedCode
        if (state.cropRegion.x < 0) {
          state.cropRegion.width += state.cropRegion.x;
          state.cropRegion.x = 0;
        }
        if (state.cropRegion.x + state.cropRegion.width > state.canvas.width) {
          state.cropRegion.width = state.canvas.width - state.cropRegion.x;
        }
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.bottomCenter}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `${state.cropRegion.width / 2}px`,
        top: `${state.cropRegion.height}px`,
      }}
    >
      <ResizeIcon rotate={180}></ResizeIcon>
    </Row>
  );
}

function BottomLeft() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      // Move the crop region by the same amount as the mouse
      state.cropRegion.x += e.movementX;
      state.cropRegion.width -= e.movementX;
      state.cropRegion.height += e.movementY;

      // Check boundaries
      // noinspection DuplicatedCode
      if (state.cropRegion.x < 0) {
        state.cropRegion.width += state.cropRegion.x;
        state.cropRegion.x = 0;
      }
      if (state.cropRegion.width < 0) {
        state.cropRegion.x += state.cropRegion.width;
        state.cropRegion.width = 0;
      }
      if (state.cropRegion.height < 0) {
        state.cropRegion.height = 0;
      }
      if (state.cropRegion.y + state.cropRegion.height > state.canvas.height) {
        state.cropRegion.height = state.canvas.height - state.cropRegion.y;
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.bottomLeft}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `0px`,
        top: `${state.cropRegion.height}px`,
      }}
    >
      <ResizeIcon rotate={225}></ResizeIcon>
    </Row>
  );
}

function LeftCenter() {
  const { state, mutate } = useDialogContext();

  function onPointerMove(e: PointerEvent) {
    mutate((state) => {
      if (state.aspectRatio === undefined) {
        // Move the crop region by the same amount as the mouse
        state.cropRegion.x += e.movementX;
        state.cropRegion.width -= e.movementX;

        // Check boundaries
        // noinspection DuplicatedCode
        if (state.cropRegion.x < 0) {
          state.cropRegion.width += state.cropRegion.x;
          state.cropRegion.x = 0;
        }
        if (state.cropRegion.width < 0) {
          state.cropRegion.x += state.cropRegion.width;
          state.cropRegion.width = 0;
        }
      }

      if (state.aspectRatio) {
        state.cropRegion.x += e.movementX;
        state.cropRegion.width -= e.movementX;

        const newHeight = state.cropRegion.width / state.aspectRatio;
        const heightDiff = newHeight - state.cropRegion.height;
        state.cropRegion.height = newHeight;
        state.cropRegion.y -= heightDiff / 2;

        // Check boundaries
        // noinspection DuplicatedCode
        if (state.cropRegion.x < 0) {
          state.cropRegion.width += state.cropRegion.x;
          state.cropRegion.x = 0;
        }
        if (state.cropRegion.width < 0) {
          state.cropRegion.x += state.cropRegion.width;
          state.cropRegion.width = 0;
        }
        // noinspection DuplicatedCode
        if (state.cropRegion.y < 0) {
          state.cropRegion.height += state.cropRegion.y;
          state.cropRegion.y = 0;
        }
        if (
          state.cropRegion.y + state.cropRegion.height >
          state.canvas.height
        ) {
          state.cropRegion.height = state.canvas.height - state.cropRegion.y;
        }
      }
    });
  }

  return (
    <Row
      class={`${styles.tool} ${styles.leftCenter}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.onpointermove = onPointerMove;
      }}
      onPointerUp={(e) => {
        e.currentTarget.onpointermove = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      style={{
        left: `0px`,
        top: `${state.cropRegion.height / 2}px`,
      }}
    >
      <ResizeIcon rotate={270}></ResizeIcon>
    </Row>
  );
}
