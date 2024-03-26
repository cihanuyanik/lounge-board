import styles from "./index.module.scss";
import moment from "moment";
import CalendarDate from "~/assets/icons/CalendarDate";
import Row from "~/components/common/Row";

type Props = {
  id?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
  format?: string;
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
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
      class={styles.DateInput}
      style={{
        background: props.background,
        color: props.color,
        "pointer-events": props.disabled ? "none" : "auto",
      }}
      onClick={() => inputRef.showPicker()}
    >
      <CalendarDate />
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
        type={"date"}
        data-value={
          props.value
            ? moment(props.value, "YYYY-MM-DD").format(
                props.format || "DD MMM YYYY",
              )
            : "01 Jan 2024"
        }
        style={{
          background: props.background,
          "font-size": props.fontSize,
          "font-weight": props.fontWeight,
        }}
        value={props.value || ""}
        min={props.min || undefined}
        max={props.max || undefined}
        onChange={() => {
          if (!inputRef.value) {
            inputRef.setAttribute("data-value", "dd/mm/yyyy");
          } else {
            inputRef.setAttribute(
              "data-value",
              moment(inputRef.value, "YYYY-MM-DD").format(
                props.format || "DD MMM YYYY",
              ),
            );
          }

          props.onChange?.(inputRef.value);
        }}
      />
    </Row>
  );
}
