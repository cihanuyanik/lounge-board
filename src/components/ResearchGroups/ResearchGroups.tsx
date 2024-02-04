import "./researchGroups.css";
import { createEffect, For, on, onCleanup, onMount, Show } from "solid-js";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import Edit from "~/assets/icons/Edit";
import EditResearchGroups, {
  EditResearchGroupsDialogResult,
} from "~/components/ResearchGroups/EditResearchGroups";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";
import Left from "~/assets/icons/Left";
import Right from "~/assets/icons/Right";

const TransPost = {
  center: "translateX(0px) translateZ(0px) rotateY(0deg)",
  left: "translateX(-50%) translateZ(-30px) rotateY(-15deg)",
  right: "translateX(+50%) translateZ(-30px) rotateY(15deg)",
};

export default function ResearchGroups() {
  const { isAdmin, researchGroups, Executor, API } = useAppContext();

  let resGroupImageRef: HTMLImageElement;
  let editResearchGroupsDialog: HTMLDialogElement = null!;

  let interval: any;

  let animRotateCenterToLeft: Animation;
  let animRotateLeftToCenter: Animation;
  let animRotateCenterToRight: Animation;
  let animRotateRightToCenter: Animation;

  onMount(() => {
    createAnimations();
    if (!isAdmin()) {
      resetInterval();
    }
  });

  onCleanup(() => clearInterval(interval));

  function createAnimations() {
    // Center position to left animation
    animRotateCenterToLeft = resGroupImageRef.animate(
      [
        {
          transform: TransPost.center,
          offset: 0,
        },
        { opacity: 1, offset: 0 },
        {
          transform: TransPost.left,
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
          transform: TransPost.left,
          offset: 0,
        },
        { opacity: 0, offset: 0 },
        {
          transform: TransPost.center,
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
          transform: TransPost.right,
          offset: 0,
        },
        { opacity: 0, offset: 0 },
        {
          transform: TransPost.center,
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
          transform: TransPost.center,
          offset: 0,
        },
        { opacity: 1, offset: 0 },
        {
          transform: TransPost.right,
          offset: 1,
        },
        { opacity: 0, offset: 1 },
      ],
      { duration: 1000 },
    );
    animRotateCenterToRight.cancel();
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(() => researchGroups.next(), 5000);
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

  async function onEditResearchGroups() {
    const dialogResult =
      await editResearchGroupsDialog.ShowModal<EditResearchGroupsDialogResult>(
        researchGroups,
      );
    if (dialogResult.result === "Cancel") return;

    await Executor.run(
      async () => {
        // Separate the ids into categories
        // ============================================
        let dResultIds = [...dialogResult.ids];
        const dResultEntities = dialogResult.entities;

        // Detect the new ones and the ones that were removed
        const newGroupIds = dResultIds.filter(
          (id) => !researchGroups.ids.includes(id),
        );

        // Remove the ones marked as new
        dResultIds = dResultIds.filter((id) => !newGroupIds.includes(id));

        // Detect the removed ones
        const removedGroupIds = researchGroups.ids.filter(
          (id) => !dResultIds.includes(id),
        );
        // Remove the ones marked as removed
        dResultIds = dResultIds.filter((id) => !removedGroupIds.includes(id));

        // Remaining ids are the ones that were updated
        const updatedGroupIds = dResultIds;

        // ============================================
        // Update firestore
        // ============================================
        API.ResearchGroups.beginTransaction();

        // Insert new ones
        for (const id of newGroupIds) {
          await API.ResearchGroups.add({
            name: dResultEntities[id].name,
            image: dResultEntities[id].image,
            bannerImage: dResultEntities[id].bannerImage,
          });
        }

        // Delete the ones that were removed
        for (const id of removedGroupIds) {
          await API.ResearchGroups.delete(researchGroups.entities[id]);
        }

        // Update firestore for the ones that were changed
        for (const id of updatedGroupIds) {
          await API.ResearchGroups.update({
            original: researchGroups.entities[id],
            changes: {
              name: dResultEntities[id].name,
              image: dResultEntities[id].image,
              bannerImage: dResultEntities[id].bannerImage,
            },
          });
        }

        await API.ResearchGroups.commitTransaction();

        // ============================================
      },
      {
        busyDialogMessage: "Updating research groups...",
      },
    );
  }

  return (
    <BlockContainer
      title={researchGroups.active ? researchGroups.active.name : ""}
      class={"research-groups-container"}
    >
      <Show when={isAdmin()}>
        <Button class={"btn-edit-res-groups"} onClick={onEditResearchGroups}>
          <Edit />
        </Button>
      </Show>
      <Row class={"res-group-image-container"}>
        <Img ref={(el) => (resGroupImageRef = el)} />
        <Show when={isAdmin()}>
          <ImageShiftControls />
        </Show>
        <CarouselBullets resetInterval={resetInterval} />
      </Row>
      <Show when={isAdmin()}>
        <EditResearchGroups ref={editResearchGroupsDialog} />
      </Show>
    </BlockContainer>
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
