import { produce, SetStoreFunction } from "solid-js/store";
import "./DateExtensions";
import "./EventRegisterExtension";
import "./ArrayExtensions";
import "./DialogExtensions";
import "./FileReaderExtensions";
import { onCleanup, onMount } from "solid-js";

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

export function sleep(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
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

type TimerProps = {
  handler: () => void;
  delayMs: number;
  type?: "timeout" | "interval"; // Default is timeout
  repeat?: boolean; // Default is true
};
export function useTimer(props: TimerProps) {
  let timerId: NodeJS.Timeout;

  onMount(() => {
    // Check props
    if (!props.type) {
      props.type = "timeout";
    }
    if (props.repeat === undefined) {
      props.repeat = true;
    }
  });

  onCleanup(() => {
    stop();
  });

  function start() {
    switch (props.type) {
      case "timeout":
        const timeOutHandler = () => {
          props.handler();
          if (props.repeat) {
            timerId = setTimeout(timeOutHandler, props.delayMs);
          }
        };
        timerId = setTimeout(timeOutHandler, props.delayMs);
        break;
      case "interval":
        timerId = setInterval(props.handler, props.delayMs);
        break;
    }
  }

  function stop() {
    switch (props.type) {
      case "timeout":
        clearTimeout(timerId);
        break;
      case "interval":
        clearInterval(timerId);
        break;
    }
  }

  // reset
  function reset() {
    stop();
    start();
  }

  return {
    id: () => timerId,
    start,
    stop,
    reset,
  };
}
