import styles from "./index.module.scss";
import { createMemo, createSignal, onMount } from "solid-js";
import { useTimer } from "~/utils/utils";

export function useColorPalette(transitionInterval?: number) {
  const [index, setIndex] = createSignal(0);

  const colorPalettes = [
    "dtuRed",
    "dtuBlue",
    "dtuGreen",
    "dtuNavyBlue",
    "dtuOrange",
    "dtuPurple",
  ];

  const colorPalette = createMemo(() => {
    return `${styles.ColorPalette} ${styles[colorPalettes[index()]]}`;
  });

  const timer = useTimer({
    handler: () => setIndex((index() + 1) % colorPalettes.length),
    type: "interval",
    delayMs: transitionInterval || 10000,
  });

  onMount(() => {
    timer.start();
  });

  return colorPalette;
}
