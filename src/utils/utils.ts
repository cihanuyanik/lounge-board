import { produce, SetStoreFunction } from "solid-js/store";
import "./DateExtensions";
import "./EventRegisterExtension";
import "./ArrayExtensions";
import "./DialogExtensions";
import "./FileReaderExtensions";

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

export function detectChanges<T>(original: T, updated: T) {
  // Detect changes occurred in the updated object with respect to the original object
  const changes = {} as Partial<T>;
  for (const key in original) {
    if (updated[key] !== undefined && original[key] !== updated[key]) {
      changes[key] = updated[key];
    }
  }
  return changes;
}

type WaitUntilReturnType = {
  success: boolean;
  waitTime: number;
};

export async function waitUntil(
  statusChecker: () => boolean,
  checkInterval: number,
  maxWaitTime: number,
): Promise<WaitUntilReturnType> {
  const startMaxWaitTime = maxWaitTime;
  while (true) {
    if (statusChecker()) {
      return { success: true, waitTime: startMaxWaitTime - maxWaitTime };
    }
    if (maxWaitTime <= 0) {
      return { success: false, waitTime: startMaxWaitTime - maxWaitTime };
    }
    maxWaitTime -= checkInterval;
    await sleep(checkInterval);
  }
}
