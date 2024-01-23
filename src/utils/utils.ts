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
