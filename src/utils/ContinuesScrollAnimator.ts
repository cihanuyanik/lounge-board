type ScrollWithAnimationOptions = {
  animationContainer: () => HTMLElement;
  scrollDirection: "up" | "down" | "left" | "right";
  totalItemDistance: () => number;
  viewPortDistance: () => number;
  pixelsPerSecondToScroll: number;
  stayAtRestDurationInMsAfterScroll?: number;
  pixelsPerSecondToReturnBack?: number;
};

export default class {
  private options: ScrollWithAnimationOptions;
  private animation: Animation | undefined;
  private timer: NodeJS.Timeout | undefined;

  constructor(options: ScrollWithAnimationOptions) {
    // Validate options
    if (
      !options.animationContainer ||
      typeof options.animationContainer !== "function"
    ) {
      throw new Error(
        "Animation container must be a valid accessor function returning a valid HTMLElement",
      );
    }

    if (!options.scrollDirection) {
      throw new Error("Scroll direction cannot be empty");
    }

    if (
      options.scrollDirection !== "up" &&
      options.scrollDirection !== "down" &&
      options.scrollDirection !== "left" &&
      options.scrollDirection !== "right"
    ) {
      throw new Error("Invalid scroll direction");
    }

    if (
      options.totalItemDistance === undefined ||
      typeof options.totalItemDistance !== "function"
    ) {
      throw new Error(
        "Total item distance must be a valid accessor function returning a positive number",
      );
    }

    if (
      options.viewPortDistance === undefined ||
      typeof options.viewPortDistance !== "function"
    ) {
      throw new Error(
        "View port distance must be a valid accessor function returning a positive number",
      );
    }

    if (
      !options.pixelsPerSecondToScroll ||
      options.pixelsPerSecondToScroll <= 0
    ) {
      throw new Error("Pixels per second to scroll must be positive number");
    }

    if (options.stayAtRestDurationInMsAfterScroll === undefined) {
      options.stayAtRestDurationInMsAfterScroll = 0;
    }

    if (options.stayAtRestDurationInMsAfterScroll < 0) {
      throw new Error(
        "Stay at rest duration after scroll must be a positive number",
      );
    }

    if (options.pixelsPerSecondToReturnBack === undefined) {
      options.pixelsPerSecondToReturnBack =
        options.pixelsPerSecondToScroll * 10;
    }

    if (options.pixelsPerSecondToReturnBack < 0) {
      throw new Error(
        "Pixels per second to return back must be a positive number",
      );
    }

    this.options = options;
  }

  private validateRunTimeOptions() {
    // Validate options
    if (!this.options.animationContainer()) {
      throw new Error("Animation container must be a valid HTMLElement");
    }

    const totalItemDistance = this.options.totalItemDistance();
    if (totalItemDistance <= 0) {
      throw new Error("Total item distance must be a positive number");
    }

    const viewPortDistance = this.options.viewPortDistance();
    if (viewPortDistance <= 0) {
      throw new Error("View port distance must be positive number");
    }

    if (viewPortDistance > totalItemDistance) {
      throw new Error(
        "Scroll animation is not necessary. View port distance is larger than total item distance",
      );
    }

    return { totalItemDistance, viewPortDistance };
  }

  private calculateDuration(scrollDistance: number) {
    // Calculate the duration of the animation
    const scrollToBottomDuration =
      scrollDistance / this.options.pixelsPerSecondToScroll;
    const stayAtRestDurationAfterScroll =
      this.options.stayAtRestDurationInMsAfterScroll! / 1000;
    const returnToTopDuration =
      scrollDistance / this.options.pixelsPerSecondToReturnBack!;

    let animationDuration =
      scrollToBottomDuration +
      stayAtRestDurationAfterScroll +
      returnToTopDuration;

    return {
      animationDuration,
      scrollToBottomDuration,
      stayAtRestDurationAfterScroll,
      returnToTopDuration,
    };
  }

  private computeStepsOffsets(durations: any) {
    // Compute steps offsets based on duration ratios
    let scrollToBottomOffset =
      durations.scrollToBottomDuration / durations.animationDuration;
    let stayAtBottomOffset =
      durations.stayAtRestDurationAfterScroll / durations.animationDuration;
    let returnToTopOffset =
      durations.returnToTopDuration / durations.animationDuration;

    // Cumulative offsets
    stayAtBottomOffset += scrollToBottomOffset;
    returnToTopOffset += stayAtBottomOffset;

    // returnToTopOffset must be 1 at this point, check if it is not
    if (returnToTopOffset !== 1) {
      // If not, then adjust it to 1
      returnToTopOffset = 1;
    }

    return { scrollToBottomOffset, stayAtBottomOffset, returnToTopOffset };
  }

  private computeMotion() {
    // Set translate function based on scroll direction
    let translate = "";
    if (
      this.options.scrollDirection === "up" ||
      this.options.scrollDirection === "down"
    ) {
      translate = "translateY";
    } else if (
      this.options.scrollDirection === "left" ||
      this.options.scrollDirection === "right"
    ) {
      translate = "translateX";
    }

    // Set direction based on scroll direction
    // down or right --> negative translate
    // up or left --> positive translate
    // 0 --> no translate
    let direction = 0;
    if (
      this.options.scrollDirection === "down" ||
      this.options.scrollDirection === "right"
    ) {
      direction = -1;
    } else if (
      this.options.scrollDirection === "up" ||
      this.options.scrollDirection === "left"
    ) {
      direction = 1;
    }

    return { translate, direction };
  }

  private createKeyFrames(motion: any, scrollDistance: number, offsets: any) {
    // Create keyframes
    return [
      {
        // Start at 0px
        transform: `${motion.translate}(0px)`,
        offset: 0, // Start at 0% of duration
      },
      {
        // Finish scrolling to bottom at -scrollDistance
        transform: `${motion.translate}(${motion.direction * scrollDistance}px)`,
        offset: offsets.scrollToBottomOffset, // Finish scrolling to bottom at 20% of duration
      },
      {
        // Stay at -scrollDistance for a while
        transform: `${motion.translate}(${motion.direction * scrollDistance}px)`,
        offset: offsets.stayAtBottomOffset, // Stay at -scrollDistance for 70% of duration
      },
      {
        // Return to 0px
        transform: `${motion.translate}(0px)`,
        offset: offsets.returnToTopOffset, // Return to back within the remaining 10% of duration
      },
    ];
  }

  public play() {
    const { totalItemDistance, viewPortDistance } =
      this.validateRunTimeOptions();

    // Compute scroll travel distance
    // Total Height of items - Scrollable container height + 16px (top + bottom padding = 1rem)
    // const scrollDistance = totalItemDistance - (viewPortDistance - 16);
    const scrollDistance = totalItemDistance - viewPortDistance;

    const durations = this.calculateDuration(scrollDistance);

    const offsets = this.computeStepsOffsets(durations);

    const motion = this.computeMotion();

    const keyFrames = this.createKeyFrames(motion, scrollDistance, offsets);

    this.animation = this.options.animationContainer().animate(keyFrames, {
      duration: durations.animationDuration * 1000,
    });
  }

  // finished promise
  get finished() {
    return this.animation?.finished;
  }

  // cancel the animation
  public cancel() {
    this.animation?.cancel();
  }

  async run(repeatDelay: number = 3000) {
    try {
      this.play();
      await this.finished;
      this.timer = setTimeout(() => this.run(), repeatDelay);
    } catch (e) {
      // Try to restart animation after 60 seconds
      this.timer = setTimeout(() => this.run(), 60000);
    }
  }

  public stop() {
    clearTimeout(this.timer);
    this.cancel();
  }
}
