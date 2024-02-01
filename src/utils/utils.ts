import { produce, SetStoreFunction } from "solid-js/store";
import "./DateExtensions";
import "./EventRegisterExtension";
import "./ArrayExtensions";
import "./DialogExtensions";
import moment from "moment/moment";

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
    throw new Error(
      "Scroll animation is not necessary. View port distance is larger than total item distance",
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

export function buildDurationString(startAt: Date, endAt: Date) {
  const startsAt = moment(startAt);
  const endsAt = moment(endAt);
  const duration = moment.duration(endsAt.diff(startsAt));

  let minutes = duration.minutes();
  let hours = duration.hours();
  let days = duration.days();

  // If minutes is 59, set it to 0 and increment hours
  if (minutes === 59) {
    minutes = 0;
    hours++;
  }

  // Build duration string
  let durationString = "";
  if (days > 0) durationString += `${days}D `;
  if (hours > 0) durationString += `${hours}H `;
  if (minutes > 0) durationString += `${minutes}M `;
  return durationString.trim();
}
