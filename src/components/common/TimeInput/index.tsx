import "./index.css";
import Clock from "~/assets/icons/Clock";
import Row from "~/components/common/Row";

type Props = {
  id?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
  value?: string;
  onChange?: (value: string) => void;
  color?: string;
  background?: string;
  fontSize?: string;
  fontWeight?: string;
  disabled?: boolean;
};

export default function (props: Props) {
  let inputRef: HTMLInputElement;

  return (
    <Row
      class={"time-input"}
      style={{
        background: props.background,
        color: props.color,
        "pointer-events": props.disabled ? "none" : "auto",
      }}
      onClick={() => inputRef.showPicker()}
    >
      <Clock style={{ height: "20px", width: "20px" }} />
      <input
        ref={(el) => {
          inputRef = el;
          if (props.ref) {
            if (typeof props.ref === "function") {
              props.ref(el);
            } else {
              props.ref = el;
            }
          }
        }}
        id={props.id || undefined}
        type={"time"}
        data-value={props.value || "hh:mm"}
        style={{
          background: props.background,
          "font-size": props.fontSize,
          "font-weight": props.fontWeight,
        }}
        value={props.value || ""}
        onChange={() => {
          if (!inputRef.value) {
            inputRef.setAttribute("data-value", "hh:mm");
          } else {
            inputRef.setAttribute("data-value", inputRef.value);
          }

          props.onChange?.(inputRef.value);
        }}
      />
    </Row>
  );
}
