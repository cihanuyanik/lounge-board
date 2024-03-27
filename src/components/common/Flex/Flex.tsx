import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

export type FlexProps = JSX.HTMLAttributes<HTMLDivElement> & {
  children?: JSX.Element | JSX.Element[];
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  alignItems?: AlignItemsOptions;
  alignContent?: AlignContentOptions;
  alignSelf?: AlignSelfOptions;
  justifyItems?: JustifyItemsOptions;
  justifyContent?: JustifyContentOptions;
  justifySelf?: JustifySelfOptions;
};

export default function Flex(props: FlexProps) {
  const [local, rest] = splitProps(props, [
    "children",
    "direction",
    "class",
    "classList",
    "alignItems",
    "alignContent",
    "alignSelf",
    "justifyItems",
    "justifyContent",
    "justifySelf",
  ]);

  // noinspection HtmlUnknownAttribute
  return (
    <div
      classList={{
        [styles.Flex]: true,
        [styles[local.direction]]: true,
        [styles[`ai-${local.alignItems}`]]: local.alignItems !== undefined,
        [styles[`ac-${local.alignContent}`]]: local.alignContent !== undefined,
        [styles[`as-${local.alignSelf}`]]: local.alignSelf !== undefined,
        [styles[`ji-${local.justifyItems}`]]: local.justifyItems !== undefined,
        [styles[`jc-${local.justifyContent}`]]:
          local.justifyContent !== undefined,
        [styles[`js-${local.justifySelf}`]]: local.justifySelf !== undefined,
        [local.class || ""]: true,
        ...local.classList,
      }}
      {...rest}
    >
      {local.children}
    </div>
  );
}

type AlignItemsOptions =
  | "normal"
  | "stretch"
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "self-start"
  | "self-end"
  | "baseline"
  | "inherit"
  | "initial"
  | "revert"
  | "unset";

type AlignContentOptions =
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "normal"
  | "baseline"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "stretch"
  | "inherit"
  | "initial"
  | "revert"
  | "unset";

type AlignSelfOptions =
  | "auto"
  | "normal"
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "self-start"
  | "self-end"
  | "baseline"
  | "stretch"
  | "inherit"
  | "initial"
  | "revert"
  | "unset";

type JustifyItemsOptions =
  | "normal"
  | "stretch"
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "self-start"
  | "self-end"
  | "left"
  | "right"
  | "baseline"
  | "inherit"
  | "initial"
  | "revert"
  | "unset";

type JustifyContentOptions =
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "left"
  | "right"
  | "normal"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "stretch"
  | "inherit"
  | "initial"
  | "revert"
  | "unset";

type JustifySelfOptions =
  | "auto"
  | "normal"
  | "stretch"
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "self-start"
  | "self-end"
  | "left"
  | "right"
  | "baseline"
  | "inherit"
  | "initial"
  | "revert"
  | "unset";
