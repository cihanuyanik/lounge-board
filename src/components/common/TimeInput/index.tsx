import styles from "./index.module.scss";
import Row from "~/components/common/Row";
import Clock from "~/assets/icons/Clock";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";

export type TimeInputRef = {
  get value(): string;
  set value(value: string);
};

type Props = {
  id?: string;
  ref?: TimeInputRef | ((el: TimeInputRef) => void);
  value?: string;
  onChange?: (value: string) => void;
};

export default function (props: Props) {
  const [hour, setHour] = createSignal("00");
  const [minute, setMinute] = createSignal("00");

  onMount(() => {
    if (props.ref) {
      const refType: TimeInputRef = {
        get value() {
          return timeValue();
        },
        set value(value: string) {
          // Check if value is valid
          setTimeValue(value);
        },
      };

      if (typeof props.ref === "function") {
        props.ref(refType);
      } else {
        props.ref = refType;
      }
    }
  });

  function setTimeValue(value: string) {
    // Check if value is valid
    const input = value.split(":");
    if (input.length !== 2) {
      throw new Error("TimeInput: Invalid time format");
    }

    // Check validity of hour
    if (parseInt(input[0]) > 23) {
      throw new Error("TimeInput: Invalid hour");
    }

    // Check validity of minute
    if (parseInt(input[1]) > 59) {
      throw new Error("TimeInput: Invalid minute");
    }

    // Set hour and minute
    setHour(input[0]);
    setMinute(input[1]);
  }

  createEffect(() => {
    if (props.value) {
      setTimeValue(props.value);
    }
  });

  const timeValue = createMemo(() => {
    return `${hour()}:${minute()}`;
  });

  return (
    <Row class={styles.TimeInput}>
      <Row class={styles.icon}>
        <Clock />
      </Row>
      <input
        class={styles.hour}
        type={"number"}
        min={0}
        max={23}
        value={hour()}
        onInput={(e) => {
          // append input value to previous one and truncate to 2 digits
          if (e.currentTarget.value.length === 1) {
            e.currentTarget.value = "0" + e.currentTarget.value;
          } else {
            e.currentTarget.value = (hour() + e.currentTarget.value).slice(-2);
          }

          // if value is larger than 23, set it to 23
          if (parseInt(e.currentTarget.value) > 23) {
            e.currentTarget.value = "23";
          }

          // set hour
          setHour(e.currentTarget.value);

          props.onChange?.(timeValue());
        }}
      />
      <p>:</p>
      <input
        class={styles.minute}
        type={"number"}
        min={0}
        max={55}
        step={5}
        value={minute()}
        onInput={(e) => {
          // append input value to previous one and truncate to 2 digits
          if (e.currentTarget.value.length === 1) {
            e.currentTarget.value = "0" + e.currentTarget.value;
          } else {
            e.currentTarget.value = (hour() + e.currentTarget.value).slice(-2);
          }

          // if value is larger than 59, set it to 59
          if (parseInt(e.currentTarget.value) > 59) {
            e.currentTarget.value = "59";
          }

          // set hour
          setMinute(e.currentTarget.value);

          props.onChange?.(timeValue());
        }}
      />
    </Row>
  );
}
