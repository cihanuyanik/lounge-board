import styles from "./index.module.scss";
import Img from "~/components/common/Img";
import { CropBox } from "~/components/ImageCropDialog/CropBox";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import Canvas, { CropperCanvas } from "~/components/ImageCropDialog/Canvas";
import Dialog, {
  createDialogContext,
  DialogRef,
} from "~/components/common/Dialog";
import Button from "~/components/common/Button";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";

export type ImageCropResult = {
  result: "Accept" | "Cancel";
  imgSrc: string;
  cropRegion: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  croppedImage: string;
  canvas: HTMLCanvasElement;
  aspectRatio?: number;
  rounded?: "none" | "full" | number;
};

export const { ContextProvider, useDialogContext } =
  createDialogContext<ImageCropResult>({
    result: "Cancel",
    imgSrc: "",
    cropRegion: { x: 0, y: 0, width: 0, height: 0 },
    croppedImage: "",
    canvas: null!,
    aspectRatio: undefined,
    rounded: undefined,
  });

type ImageCropDialogProps = {
  ref: DialogRef;
  aspectRatio?: number;
  rounded?: "none" | "full" | number;
};

export default function ImageCropDialog(props: ImageCropDialogProps) {
  return (
    <ContextProvider>
      <_ImageCropDialog
        ref={props.ref}
        aspectRatio={props.aspectRatio}
        rounded={props.rounded}
      />
    </ContextProvider>
  );
}

function _ImageCropDialog(props: ImageCropDialogProps) {
  const { state, mutate } = useDialogContext();

  let imageToCrop: HTMLImageElement;
  let cropBox: HTMLDivElement;
  let cropper: CropperCanvas;

  function onImageLoaded(dialog: HTMLDialogElement) {
    // At this point all the sizes are known and has been settled, so we can initialize the cropper
    // And set its initial size and location

    cropper = new CropperCanvas(state.canvas, imageToCrop);
    cropper.update();

    // Update dialog size by the image size
    dialog.style.height = `${cropper.canvas.height}px`;
    dialog.style.width = `${cropper.canvas.width}px`;

    if (props.aspectRatio === undefined) {
      // Free aspect ratio
      mutate((state) => {
        state.cropRegion = {
          x: cropper.canvas.offsetLeft,
          y: cropper.canvas.offsetTop,
          width: cropper.canvas.width,
          height: cropper.canvas.height,
        };
      });
    } else {
      mutate((state) => {
        // Fixed aspect ratio
        const aspectRatio = props.aspectRatio || 1;

        // Try height dominant case
        let cropBoxWidth = cropper.canvas.height * aspectRatio;
        let cropBoxHeight = cropper.canvas.height;

        // Check size inside canvas
        if (cropBoxWidth > cropper.canvas.width) {
          cropBoxWidth = cropper.canvas.width;
          cropBoxHeight = cropBoxWidth / aspectRatio;
        }

        // Compute x, y to keep crop box in the middle
        let cropBoxX = (cropper.canvas.width - cropBoxWidth) / 2;
        let cropBoxY = (cropper.canvas.height - cropBoxHeight) / 2;

        // Also consider canvas offset as well
        cropBoxX += cropper.canvas.offsetLeft;
        cropBoxY += cropper.canvas.offsetTop;

        // Update crop box region state
        state.cropRegion = {
          x: cropBoxX,
          y: cropBoxY,
          width: cropBoxWidth,
          height: cropBoxHeight,
        };
      });
    }
  }

  function onBeforeShow(ev: CustomEvent) {
    const imgSrc = ev.detail as string;
    // reset the dialog size by the original size
    const dialog = ev.target as HTMLDialogElement;
    dialog.style.height = `75%`;
    dialog.style.width = `75%`;

    mutate((state) => {
      state.result = "Cancel";
      state.imgSrc = imgSrc;
      state.croppedImage = "";
      state.cropRegion = { x: 0, y: 0, width: 0, height: 0 };
      state.aspectRatio = props.aspectRatio;
      state.rounded = props.rounded;
    });

    imageToCrop.onload = () => {
      onImageLoaded(dialog);
    };
  }

  function onClose(ev: CustomEvent) {
    // set the result by cropping the image
    mutate((state) => {
      state.imgSrc = "";
      if (state.result === "Accept" && state.cropRegion) {
        state.croppedImage = cropper.crop(state.cropRegion);
      }
    });

    // destroy cropper, mainly unregistering events
    cropper.destroy();

    // Resolve the dialog result
    (ev.target as HTMLDialogElement).Resolve(state);
  }

  return (
    <Dialog
      id={"image-crop-dialog"}
      class={styles.ImageCropDialog}
      ref={props.ref}
      onBeforeShow={onBeforeShow}
      onClose={onClose}
    >
      <Column class={styles.content}>
        <Row class={styles.row}>
          <Img ref={(el) => (imageToCrop = el)} src={state.imgSrc} />
          <Canvas ref={(el) => mutate((state) => (state.canvas = el))} />
          <CropBox ref={(el) => (cropBox = el)} />
          <DialogControls
            onAccept={() => {
              mutate((state) => (state.result = "Accept"));
              const dialog = document.getElementById(
                "image-crop-dialog",
              ) as HTMLDialogElement | null;
              dialog?.Close();
            }}
            onCancel={() => {
              mutate((state) => (state.result = "Cancel"));
              const dialog = document.getElementById(
                "image-crop-dialog",
              ) as HTMLDialogElement | null;
              dialog?.Close();
            }}
          />
        </Row>
      </Column>
    </Dialog>
  );
}

type DialogControlsProps = {
  disabled?: boolean;
  onAccept: () => void;
  onCancel: () => void;
};

function DialogControls(props: DialogControlsProps) {
  return (
    <>
      <Button
        classList={{
          [styles.controlButton]: true,
          [styles.accept]: true,
        }}
        onClick={props.onAccept}
        disabled={props.disabled}
      >
        <Tick />
      </Button>

      <Button
        classList={{
          [styles.controlButton]: true,
          [styles.cancel]: true,
        }}
        onClick={props.onCancel}
      >
        <Cross />
      </Button>
    </>
  );
}
