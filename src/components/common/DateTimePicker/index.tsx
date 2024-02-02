import "./index.scss";
import Row from "~/components/common/Row";
import DateInput from "~/components/common/DateInput";
import TimeInput, { TimeInputRef } from "~/components/common/TimeInput";
import Column from "~/components/common/Column";
import {
  batch,
  createEffect,
  createSignal,
  JSX,
  onMount,
  Show,
} from "solid-js";

export type DateTimePickerRef = {
  get value(): string;
  set value(value: string);
};

type Props = {
  id?: string;
  class?: string;
  label?: string;
  icon?: (props: any) => JSX.Element;
  height?: string | number;
  dateFormat?: string;
  ref?: (ref: DateTimePickerRef) => void;
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
};

export default function (props: Props) {
  let dateRef: HTMLInputElement = null!;
  let timeRef: TimeInputRef = null!;

  onMount(() => {
    if (props.ref) {
      // create ref object
      const ref: DateTimePickerRef = {
        get value() {
          return `${date()}T${time()}`;
        },
        set value(value: string) {
          // Validate the date
          if (isNaN(new Date(value).getTime())) {
            throw new Error("Invalid date");
          }

          // Update the date and time
          batch(() => {
            setDate(value.split("T")[0]);
            setTime(value.split("T")[1]);
          });
        },
      };

      // Pass the ref object to the parent component
      props.ref(ref);
    }
  });

  const [date, setDate] = createSignal(
    props.value?.split("T")[0] || new Date().toLocaleISOString(),
  );

  const [time, setTime] = createSignal(props.value?.split("T")[1] || "00:00");

  createEffect(() => {
    if (props.value) {
      // Validate the date
      if (isNaN(new Date(props.value).getTime())) {
        return;
      }

      // Update the date and time
      batch(() => {
        setDate(props.value!.split("T")[0]);
        setTime(props.value!.split("T")[1]);
      });
    }
  });

  return (
    <Column
      id={props.id}
      class={"date-time-picker" + (props.class ? " " + props.class : "")}
      style={{
        "--label-height": props.label ? "26px" : "0px",
        "--container-height": props.height ? `${props.height}px` : "70px",
      }}
    >
      <Show when={props.icon}>{props.icon}</Show>
      <Show when={props.label}>
        <label>{props.label}</label>
      </Show>
      <Row class={"date-time-container"}>
        <DateInput
          ref={dateRef}
          format={props.dateFormat || "DD MMM YYYY"}
          background={"transparent"}
          value={date()}
          min={props.min?.split("T")[0]}
          max={props.max?.split("T")[0]}
          onChange={(value) => {
            setDate(value);
            props.onChange?.(`${value}T${time()}`);
          }}
        />
        <p>-</p>
        <TimeInput
          ref={timeRef}
          value={time()}
          onChange={(value) => {
            setTime(value);
            props.onChange?.(`${date()}T${value}`);
          }}
        />
      </Row>
    </Column>
  );
}
