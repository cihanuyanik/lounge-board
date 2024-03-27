import styles from "./index.module.scss";
import Img from "~/components/common/Img";
import AvatarPlaceholder from "~/assets/images/member-placeholder.png";
import ImageSelectInput from "~/components/ImageSelectInput";
import ImageCropDialog, { ImageCropResult } from "~/components/ImageCropDialog";
import { Show } from "solid-js";
import Row from "~/components/common/Flex/Row";

type AvatarProps = {
  imgSrc: string;
  enableImageSelect?: boolean;
  onImageSelected?: (imageData: string) => void;
  enableImageCrop?: boolean;
  cropAspectRatio?: number; // width / height default 250 / 300
  cropRounded?: "none" | "full" | number; // default "full"
  class?: string;
};

export default function Avatar(props: AvatarProps) {
  let imageCropDialog: HTMLDialogElement = null!;

  return (
    <Row class={`${styles.Avatar}${props.class ? " " + props.class : ""}`}>
      <Img src={props.imgSrc || AvatarPlaceholder} />

      <Show when={props.enableImageSelect}>
        <ImageSelectInput
          onImageSelected={async (image) => {
            const reader = new FileReader();
            let result = await reader.readAsyncAsDataURL(image);
            if (!result || typeof result !== "string" || result === "") return;

            if (props.enableImageCrop) {
              const dResult =
                await imageCropDialog.ShowModal<ImageCropResult>(result);
              if (dResult.result === "Cancel") return;

              if (dResult.croppedImage) {
                result = dResult.croppedImage;
              }
            }

            props.onImageSelected?.(result);
          }}
        />
      </Show>

      <Show when={props.enableImageCrop}>
        <ImageCropDialog
          ref={imageCropDialog}
          aspectRatio={props.cropAspectRatio || 250 / 300}
          rounded={props.cropRounded || "full"}
        />
      </Show>
    </Row>
  );
}
