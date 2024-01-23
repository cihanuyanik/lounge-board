import CanvasBackground from "~/assets/images/empty-canvas-background.jpg";
import { useDialogContext } from "~/components/ImageCropDialog/index";

export default function Canvas(props: {
  ref: (el: HTMLCanvasElement) => void;
}) {
  const { state, mutate } = useDialogContext();

  let canvas: HTMLCanvasElement;

  function onPointerDown(e: PointerEvent) {
    mutate((state) => {
      state.cropRegion = {
        x: e.offsetX + canvas.offsetLeft,
        y: e.offsetY + canvas.offsetTop,
        width: 0,
        height: 0,
      };
    });

    canvas.onpointermove = (e) => {
      if (!state.cropRegion) return;

      let width = 0;
      let height = 0;
      if (state.aspectRatio === undefined) {
        width = e.offsetX + canvas.offsetLeft - state.cropRegion.x;
        height = e.offsetY + canvas.offsetTop - state.cropRegion.y;
      } else if (state.aspectRatio >= 1) {
        width = e.offsetX + canvas.offsetLeft - state.cropRegion.x;
        height = width / state.aspectRatio!;
      } else if (state.aspectRatio < 1) {
        height = e.offsetY + canvas.offsetTop - state.cropRegion.y;
        width = height * state.aspectRatio!;
      }

      mutate((state) => {
        state.cropRegion.width = width;
        state.cropRegion.height = height;
      });
    };

    canvas.setPointerCapture(e.pointerId);
  }

  function onPointerUp(e: PointerEvent) {
    canvas.onpointermove = null;
    canvas.releasePointerCapture(e.pointerId);
  }

  return (
    <canvas
      ref={(el) => {
        canvas = el;
        props.ref(el);
      }}
      class={"canvas"}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    />
  );
}

export class CropperCanvas {
  private readonly aRatio: number;
  private ctx: CanvasRenderingContext2D;
  private readonly background: HTMLImageElement;
  private imageDrawBounds: {
    sHeight: number;
    dx: number;
    sx: number;
    dy: number;
    sy: number;
    dHeight: number;
    sWidth: number;
    dWidth: number;
  };

  constructor(
    public canvas: HTMLCanvasElement,
    public image: HTMLImageElement,
  ) {
    // Set the canvas size to the image size

    this.aRatio = this.image.naturalWidth / this.image.naturalHeight;
    if (this.aRatio > 1) {
      this.canvas.width = this.image.width;
      this.canvas.height = this.image.width / this.aRatio;
    } else {
      this.canvas.height = this.image.height;
      this.canvas.width = this.image.height * this.aRatio;
    }

    // Get 2d context
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    // Initialize image draw bounds
    this.imageDrawBounds = {
      sx: 0,
      sy: 0,
      sWidth: image.naturalWidth,
      sHeight: image.naturalHeight,
      dx: 0,
      dy: 0,
      dWidth: canvas.width,
      dHeight: canvas.height,
    };

    // Load empty canvas background image
    this.background = new Image();
    this.background.src = CanvasBackground;

    // Setup event listeners on canvas
    this.canvas.addEventListener("wheel", this.onWheel.bind(this));
  }

  destroy() {
    this.canvas.removeEventListener("wheel", this.onWheel.bind(this));
  }

  onWheel(e: WheelEvent) {
    this.zoom(e.deltaY / Math.abs(e.deltaY), e.offsetX, e.offsetY);
    this.update();
  }

  putBackground() {
    this.ctx.drawImage(
      this.background,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
  }

  putImage() {
    this.ctx.drawImage(
      this.image,
      this.imageDrawBounds.sx,
      this.imageDrawBounds.sy,
      this.imageDrawBounds.sWidth,
      this.imageDrawBounds.sHeight,
      this.imageDrawBounds.dx,
      this.imageDrawBounds.dy,
      this.imageDrawBounds.dWidth,
      this.imageDrawBounds.dHeight,
    );
  }

  getZoomStep() {
    return Math.round(
      (this.imageDrawBounds.sWidth + this.imageDrawBounds.sHeight) * 0.05,
    );
  }

  zoom(direction: number, x: number, y: number) {
    // direction = -1 => zoom in
    // direction = 1 => zoom out

    // Zoom out
    const zoomStep = this.getZoomStep() * direction;

    const widthChange = zoomStep;
    const heightChange = zoomStep / this.aRatio;

    this.imageDrawBounds.sWidth += widthChange;
    this.imageDrawBounds.sHeight += heightChange;

    const sxChange = (x / this.canvas.width) * widthChange;
    const syChange = (y / this.canvas.height) * heightChange;

    // Center the image
    this.imageDrawBounds.sx -= sxChange;
    this.imageDrawBounds.sy -= syChange;
  }

  update() {
    this.putBackground();
    this.putImage();
  }

  crop(cropRegion: { x: number; y: number; width: number; height: number }) {
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropRegion.width;
    cropCanvas.height = cropRegion.height;
    const cropCtx = cropCanvas.getContext("2d") as CanvasRenderingContext2D;
    cropCtx.drawImage(
      this.canvas,
      cropRegion.x,
      cropRegion.y,
      cropRegion.width,
      cropRegion.height,
      0,
      0,
      cropRegion.width,
      cropRegion.height,
    );
    return cropCanvas.toDataURL();
  }
}
