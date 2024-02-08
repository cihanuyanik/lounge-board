import "./researchGroups.css";
import { createEffect, For, on, onMount, Show } from "solid-js";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import Edit from "~/assets/icons/Edit";
import EditResearchGroups from "~/components/ResearchGroups/EditResearchGroups";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";
import Left from "~/assets/icons/Left";
import Right from "~/assets/icons/Right";
import { useTimer } from "~/utils/utils";

export default function ResearchGroups() {
  const { isAdmin, researchGroups } = useAppContext();

  let editDialog: HTMLDialogElement = null!;

  return (
    <BlockContainer
      title={researchGroups.active ? researchGroups.active.name : ""}
      class={"research-groups-container"}
    >
      <Show when={isAdmin()}>
        <Button
          class={"btn-edit-res-groups"}
          onClick={() => editDialog.ShowModal(researchGroups)}
          popupContent={"Edit research groups"}
        >
          <Edit />
        </Button>
      </Show>
      <Carousel />
      <Show when={isAdmin()}>
        <EditResearchGroups ref={editDialog} />
      </Show>
    </BlockContainer>
  );
}

function Carousel() {
  const { isAdmin, researchGroups } = useAppContext();

  let resGroupImageRef: HTMLImageElement;
  let animRotateCenterToLeft: Animation;
  let animRotateLeftToCenter: Animation;
  let animRotateCenterToRight: Animation;
  let animRotateRightToCenter: Animation;

  const timer = useTimer({
    handler: () => researchGroups.next(),
    type: "interval",
    delayMs: 5000,
  });

  onMount(() => {
    createAnimations();
    if (!isAdmin()) timer.start();
  });

  function createAnimations() {
    const TransPos = {
      center: "translateX(0px) translateZ(0px) rotateY(0deg)",
      left: "translateX(-50%) translateZ(-30px) rotateY(-15deg)",
      right: "translateX(+50%) translateZ(-30px) rotateY(15deg)",
    };

    // Center position to left animation
    animRotateCenterToLeft = resGroupImageRef.animate(
      [
        {
          transform: TransPos.center,
          offset: 0,
        },
        { opacity: 1, offset: 0 },
        {
          transform: TransPos.left,
          offset: 1,
        },
        { opacity: 0, offset: 1 },
      ],
      { duration: 1000 },
    );
    animRotateCenterToLeft.cancel();

    // Left position to center animation
    animRotateLeftToCenter = resGroupImageRef.animate(
      [
        {
          transform: TransPos.left,
          offset: 0,
        },
        { opacity: 0, offset: 0 },
        {
          transform: TransPos.center,
          offset: 1,
        },
        { opacity: 1, offset: 1 },
      ],
      { duration: 1000 },
    );
    animRotateLeftToCenter.cancel();

    // Right position to center animation
    animRotateRightToCenter = resGroupImageRef.animate(
      [
        {
          transform: TransPos.right,
          offset: 0,
        },
        { opacity: 0, offset: 0 },
        {
          transform: TransPos.center,
          offset: 1,
        },
        { opacity: 1, offset: 1 },
      ],
      { duration: 1000 },
    );
    animRotateRightToCenter.cancel();

    // Center position to right animation
    animRotateCenterToRight = resGroupImageRef.animate(
      [
        {
          transform: TransPos.center,
          offset: 0,
        },
        { opacity: 1, offset: 0 },
        {
          transform: TransPos.right,
          offset: 1,
        },
        { opacity: 0, offset: 1 },
      ],
      { duration: 1000 },
    );
    animRotateCenterToRight.cancel();
  }

  createEffect(
    on(
      () => researchGroups.active,
      async () => {
        if (!researchGroups.active) return;

        if (researchGroups.activeChangeDirection === "next") {
          animRotateCenterToLeft.play();
          await animRotateCenterToLeft.finished;

          resGroupImageRef.src = researchGroups.active.image;

          animRotateRightToCenter.play();
          await animRotateRightToCenter.finished;
        }

        if (researchGroups.activeChangeDirection === "prev") {
          animRotateCenterToRight.play();
          await animRotateCenterToRight.finished;

          resGroupImageRef.src = researchGroups.active.image;

          animRotateLeftToCenter.play();
          await animRotateLeftToCenter.finished;
        }
      },
    ),
  );

  return (
    <Row class={"res-group-image-container"}>
      <Img ref={(el) => (resGroupImageRef = el)} />
      <Show when={isAdmin()}>
        <ImageShiftControls />
      </Show>
      <CarouselBullets resetInterval={timer.reset} />
    </Row>
  );
}

function ImageShiftControls() {
  const { researchGroups } = useAppContext();

  return (
    <Row class={"image-shift-controls"}>
      <Button onClick={() => researchGroups.prev()}>
        <Left />
      </Button>
      <Button onClick={() => researchGroups.next()}>
        <Right />
      </Button>
    </Row>
  );
}

function CarouselBullets(props: { resetInterval: () => void }) {
  const { researchGroups, isAdmin } = useAppContext();

  return (
    <Row class={"carousel-bullets"}>
      <For each={researchGroups.ids}>
        {(id) => (
          <div
            class={"bullet"}
            classList={{ active: researchGroups.active?.id === id }}
            onClick={() => {
              researchGroups.setActive(id);
              if (!isAdmin()) {
                props.resetInterval();
              }
            }}
          />
        )}
      </For>
    </Row>
  );
}
