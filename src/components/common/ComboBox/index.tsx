import "./index.scss";
import { JSX } from "solid-js";

type Props = {
  children: JSX.Element | JSX.Element[];
  rootStyle?: JSX.CSSProperties;
  selectStyle?: JSX.CSSProperties;
  value?: string;
  onInput?: JSX.DOMAttributes<HTMLSelectElement>["onInput"];
};
export default function (props: Props) {
  return (
    <div class={"combo-box"} style={props.rootStyle}>
      <select
        value={props.value}
        onInput={props.onInput}
        style={props.selectStyle}
      >
        {props.children}
      </select>
    </div>
  );
}
