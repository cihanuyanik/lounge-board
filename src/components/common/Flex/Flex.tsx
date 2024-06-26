import styles from "./index.module.scss";
import { JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export type FlexProps = JSX.HTMLAttributes<HTMLDivElement> & {
  as?: string;
  children?: JSX.Element | JSX.Element[];
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  alignItems?: "center" | "start" | "end" | "stretch" | "unset";
  alignContent?:
    | "center"
    | "start"
    | "end"
    | "stretch"
    | "space-between"
    | "space-around"
    | "space-evenly"
    | "unset";
  alignSelf?: "center" | "start" | "end" | "stretch" | "unset";
  justifyItems?:
    | "center"
    | "start"
    | "end"
    | "stretch"
    | "left"
    | "right"
    | "unset";
  justifyContent?:
    | "center"
    | "start"
    | "end"
    | "stretch"
    | "left"
    | "right"
    | "space-between"
    | "space-around"
    | "space-evenly"
    | "unset";
  justifySelf?:
    | "center"
    | "start"
    | "end"
    | "stretch"
    | "left"
    | "right"
    | "unset";
  gap?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
  width?: "auto" | "full" | "half" | "third" | "quarter" | "screen";
  height?: "auto" | "full" | "half" | "third" | "quarter" | "screen";
  flex?: "1" | "2" | "3" | "4" | "5";

  verAlign?: "top" | "center" | "bottom";
  horAlign?: "left" | "center" | "right";
  align?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
};

export default function Flex(props: FlexProps) {
  const [local, rest] = splitProps(props, [
    "as",
    "children",
    "direction",
    "wrap",
    "class",
    "classList",
    "alignItems",
    "alignContent",
    "alignSelf",
    "justifyItems",
    "justifyContent",
    "justifySelf",
    "gap",
    "width",
    "height",
    "flex",
    "verAlign",
    "horAlign",
    "align",
  ]);

  // noinspection HtmlUnknownAttribute
  return (
    <Dynamic
      component={local.as || "div"}
      classList={{
        [styles.Flex]: true,
        [styles[local.direction]]: true,
        [styles[local.wrap || ""]]: local.wrap !== undefined,
        [styles[`ai-${local.alignItems}`]]: local.alignItems !== undefined,
        [styles[`ac-${local.alignContent}`]]: local.alignContent !== undefined,
        [styles[`as-${local.alignSelf}`]]: local.alignSelf !== undefined,
        [styles[`ji-${local.justifyItems}`]]: local.justifyItems !== undefined,
        [styles[`jc-${local.justifyContent}`]]:
          local.justifyContent !== undefined,
        [styles[`js-${local.justifySelf}`]]: local.justifySelf !== undefined,
        [styles[`gap-${local.gap}`]]: local.gap !== undefined,
        [styles[`w-${local.width}`]]: local.width !== undefined,
        [styles[`h-${local.height}`]]: local.height !== undefined,
        [styles[`flex-${local.flex}`]]: local.flex !== undefined,
        [styles[`va-${local.verAlign}`]]: local.verAlign !== undefined,
        [styles[`ha-${local.horAlign}`]]: local.horAlign !== undefined,
        [styles[`ai-${local.align}`]]: local.align !== undefined,
        [local.class || ""]: true,
        ...local.classList,
      }}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
}
