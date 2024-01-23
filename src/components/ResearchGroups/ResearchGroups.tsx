import "./researchGroups.scss";
import { createEffect, on, onCleanup, onMount, Show } from "solid-js";
import Img from "~/components/common/Img";
import Button from "~/components/common/Button";
import Edit from "~/assets/icons/Edit";
import EditResearchGroups, {
  EditResearchGroupsDialogResult,
} from "~/components/ResearchGroups/EditResearchGroups";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import BlockContainer from "~/components/common/BlockContainer";
import { API } from "~/api/Firebase";

export default function ResearchGroups() {
  const { isAdmin, researchGroups, busyDialog, messageBox } = useAppContext();

  let resGroupImageRef: HTMLImageElement;
  let editResearchGroupsDialog: HTMLDialogElement = null!;

  let interval: any;

  let transformOut: Animation;
  let opacityOut: Animation;
  let transformIn: Animation;
  let opacityIn: Animation;

  onMount(() => {
    if (isAdmin()) return;
    interval = setInterval(() => researchGroups.next(), 5000);

    transformOut = resGroupImageRef.animate(
      [
        { transform: "translateX(0px) translateZ(0px) rotateY(0deg)" },
        { transform: "translateX(-50%) translateZ(-30px) rotateY(-15deg)" },
      ],
      { duration: 1000 },
    );

    opacityOut = resGroupImageRef.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 1000,
    });

    transformIn = resGroupImageRef.animate(
      [
        { transform: "translateX(+50%) translateZ(-30px) rotateY(15deg)" },
        { transform: "translateX(0px) translateZ(0px) rotateY(0deg)" },
      ],
      { duration: 1000 },
    );

    opacityIn = resGroupImageRef.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 1000,
    });
  });

  onCleanup(() => clearInterval(interval));

  createEffect(
    on(
      () => researchGroups.active,

      async () => {
        if (!researchGroups.active) return;

        if (!isAdmin()) {
          transformOut.play();
          opacityOut.play();
          await Promise.all([transformOut.finished, opacityOut.finished]);
        }

        resGroupImageRef.src = researchGroups.active.image;

        if (!isAdmin()) {
          transformIn.play();
          opacityIn.play();
          await Promise.all([transformIn.finished, opacityIn.finished]);
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

    try {
      busyDialog.show("Updating research groups...");

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

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
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
      </Row>
      <Show when={isAdmin()}>
        <EditResearchGroups ref={editResearchGroupsDialog} />
      </Show>
    </BlockContainer>
  );
}
