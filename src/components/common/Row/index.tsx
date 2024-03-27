import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";

type RowProps = JSX.HTMLAttributes<HTMLDivElement> & {
  children?: JSX.Element | JSX.Element[];
  alignItems?: AlignItemsOptions;
  alignContent?: AlignContentOptions;
  alignSelf?: AlignSelfOptions;
  justifyItems?: JustifyItemsOptions;
  justifyContent?: JustifyContentOptions;
  justifySelf?: JustifySelfOptions;
};

export default function Row(props: RowProps) {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
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
      class={`${styles.Row}${local.class ? " " + local.class : ""}`}
      // @ts-ignore
      alignItems={local.alignItems}
      alignContent={local.alignContent}
      alignSelf={local.alignSelf}
      justifyItems={local.justifyItems}
      justifyContent={local.justifyContent}
      justifySelf={local.justifySelf}
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
