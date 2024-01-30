import { produce, SetStoreFunction } from "solid-js/store";
import "./DateExtensions";
import "./EventRegisterExtension";
import "./ArrayExtensions";
import "./DialogExtensions";

/**
 * Creates a mutate function built on top of given setter function
 * @param set SolidJs store object setter
 * @returns mutator function
 */
export function createMutator<TStore>(set: SetStoreFunction<TStore>) {
  return (transition: (state: TStore) => void) => {
    set(produce(transition));
  };
}

export function sleep(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function scrollBottomAnimation(
  container: HTMLElement,
  durationMs: number = 1000,
  microStepDurationMs: number = 20,
) {
  const stepCount = Math.floor(durationMs / microStepDurationMs);

  // Check if scrolled to bottom
  if (container.scrollTop + container.offsetHeight >= container.scrollHeight) {
    // Scroll to top
    while (container.scrollTop > 0) {
      container.scrollTop -= container.scrollHeight / stepCount;
      await sleep(microStepDurationMs);
    }
  } else {
    // Find fully visible children
    const containerRect = container.getBoundingClientRect();

    // filter fully visible children
    const visibleChildren = [];
    for (const children of container.children) {
      const childrenRect = children.getBoundingClientRect();
      if (
        childrenRect.top >= containerRect.top &&
        childrenRect.bottom <= containerRect.bottom
      ) {
        visibleChildren.push(children);
      }
    }

    // If all items are visible no need to animate for scroll
    if (visibleChildren.length === container.children.length) return;

    // Get first & last visible child
    const firstVisibleChild = visibleChildren.at(0);
    const secondVisibleChild = visibleChildren.at(1);
    const lastVisibleChild = visibleChildren.at(-1);
    if (!firstVisibleChild || !secondVisibleChild || !lastVisibleChild) return;

    // Compute the distance to scroll
    const gapBetweenChildren =
      secondVisibleChild.getBoundingClientRect().top -
      firstVisibleChild.getBoundingClientRect().bottom;

    let scrollAmount =
      lastVisibleChild.getBoundingClientRect().bottom +
      gapBetweenChildren -
      firstVisibleChild.getBoundingClientRect().top;

    // Scroll
    let scrollStepAmount = Math.floor(scrollAmount / stepCount);

    while (scrollAmount > 0) {
      if (scrollAmount < scrollStepAmount) scrollStepAmount = scrollAmount;
      container.scrollTop += scrollStepAmount;
      scrollAmount -= scrollStepAmount;
      await sleep(microStepDurationMs);
    }
  }
}

export function toDate(
  source: Date | object | string | null | undefined,
): Date {
  if (source === null || source === undefined)
    // @ts-ignore
    return undefined;

  if (source instanceof Date) return source;

  // @ts-ignore
  if (typeof source === "object" && source.toDate !== undefined)
    // @ts-ignore
    return source.toDate();
  if (typeof source === "string") return new Date(source);
  return new Date();
}

// TODO: Make these arguments as object
type ScrollWithAnimationOptions = {
  animationContainer: HTMLElement;
  scrollDirection: "up" | "down" | "left" | "right";
  totalItemDistance: number;
  viewPortDistance: number;
  pixelsPerSecondToScroll: number;
  stayAtRestDurationInMsAfterScroll?: number;
  pixelsPerSecondToReturnBack?: number;
};
export function scrollWithAnimation(options: ScrollWithAnimationOptions) {
  // Validate options
  if (!options.animationContainer) {
    throw new Error("Animation container must be a valid HTMLElement");
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

  if (!options.totalItemDistance || options.totalItemDistance <= 0) {
    throw new Error("Total item distance must be a positive number");
  }

  if (!options.viewPortDistance || options.viewPortDistance <= 0) {
    throw new Error("View port distance must be positive number");
  }

  if (options.viewPortDistance > options.totalItemDistance) {
    return;
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
      "Stay at rest duration after scroll must be positive number",
    );
  }

  if (options.pixelsPerSecondToReturnBack === undefined) {
    options.pixelsPerSecondToReturnBack = options.pixelsPerSecondToScroll * 10;
  }

  // Compute scroll travel distance
  // Total Height of items - Scrollable container height + 16px (top + bottom padding = 1rem)
  // const scrollDistance = totalItemDistance - (viewPortDistance - 16);
  const scrollDistance = options.totalItemDistance - options.viewPortDistance;

  // Calculate the duration of the animation
  const scrollToBottomDuration =
    scrollDistance / options.pixelsPerSecondToScroll;
  const stayAtRestDurationAfterScroll =
    options.stayAtRestDurationInMsAfterScroll / 1000;
  const returnToTopDuration =
    scrollDistance / options.pixelsPerSecondToReturnBack;

  let animationDuration =
    scrollToBottomDuration +
    stayAtRestDurationAfterScroll +
    returnToTopDuration;

  // Compute steps offsets based on duration ratios
  let scrollToBottomOffset = scrollToBottomDuration / animationDuration;
  let stayAtBottomOffset = stayAtRestDurationAfterScroll / animationDuration;
  let returnToTopOffset = returnToTopDuration / animationDuration;

  // Cumulative offsets
  stayAtBottomOffset += scrollToBottomOffset;
  returnToTopOffset += stayAtBottomOffset;

  // returnToTopOffset must be 1 at this point, check if it is not
  if (returnToTopOffset !== 1) {
    // If not, then adjust it to 1
    returnToTopOffset = 1;
  }

  // Set translate function based on scroll direction
  let translate = "";
  if (options.scrollDirection === "up" || options.scrollDirection === "down") {
    translate = "translateY";
  } else if (
    options.scrollDirection === "left" ||
    options.scrollDirection === "right"
  ) {
    translate = "translateX";
  }

  // Set direction based on scroll direction
  // down or right --> negative translate
  // up or left --> positive translate
  // 0 --> no translate
  let direction = 0;
  if (
    options.scrollDirection === "down" ||
    options.scrollDirection === "right"
  ) {
    direction = -1;
  } else if (
    options.scrollDirection === "up" ||
    options.scrollDirection === "left"
  ) {
    direction = 1;
  }

  // Create keyframes
  const keyFrames = [] as Keyframe[];

  keyFrames.push({
    // Start at 0px
    transform: `${translate}(0px)`,
    offset: 0, // Start at 0% of duration
  });

  keyFrames.push({
    // Finish scrolling to bottom at -scrollDistance
    transform: `${translate}(${direction * scrollDistance}px)`,
    offset: scrollToBottomOffset, // Finish scrolling to bottom at 20% of duration
  });

  keyFrames.push({
    // Stay at -scrollDistance for a while
    transform: `${translate}(${direction * scrollDistance}px)`,
    offset: stayAtBottomOffset, // Stay at -scrollDistance for 70% of duration
  });

  keyFrames.push({
    // Return to 0px
    transform: `${translate}(0px)`,
    offset: returnToTopOffset, // Return to back within the remaining 10% of duration
  });

  return options.animationContainer.animate(keyFrames, {
    duration: animationDuration * 1000,
  });
}
