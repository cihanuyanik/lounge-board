import styles from "./index.module.scss";
import Row from "~/components/common/Flex/Row";
import Tick from "~/assets/icons/Tick";
import { Show } from "solid-js";

type SelectedMarkerProps = { visible: boolean };

export default function SelectedMarker(props: SelectedMarkerProps) {
  return (
    <Show when={props.visible}>
      <Row as={"selected-marker"} class={styles.SelectedMarker}>
        <Tick />
      </Row>
    </Show>
  );
}
