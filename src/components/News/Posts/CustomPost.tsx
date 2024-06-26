import styles from "./posts.module.scss";
import Column from "~/components/common/Flex/Column";
import Row from "~/components/common/Flex/Row";
import Img from "~/components/common/Img";
import moment from "moment";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Timestamp } from "firebase/firestore";
import DefaultAvatar from "~/assets/images/member-placeholder.png";

type CustomPostProps = {
  width: number;
  avatarUrl: string;
  title: string;
  postHtml: string;
  updatedAt: Timestamp;
};

export default function CustomPost(props: CustomPostProps) {
  const [timePassed, setTimePassed] = createSignal(
    moment(props.updatedAt.toDate()).fromNow(),
  );

  const contentBody = createMemo(() => {
    return new DOMParser().parseFromString(props.postHtml || "", "text/html")
      .body;
  });

  let timePassedUpdateTimer: NodeJS.Timeout;
  onMount(() => setTimeout(runTimePassedUpdater, 3000));
  onCleanup(() => clearInterval(timePassedUpdateTimer));

  function runTimePassedUpdater() {
    const timePassed = moment(props.updatedAt.toDate()).fromNow();
    setTimePassed(timePassed);

    let durationMs;

    if (timePassed.includes("sec") || timePassed.includes("min")) {
      // Run every minutes
      durationMs = 60 * 1000;
    } else if (timePassed.includes("hour")) {
      // Run every hour
      durationMs = 60 * 60 * 1000;
    } else {
      // Run every day
      durationMs = 24 * 60 * 60 * 1000;
    }

    timePassedUpdateTimer = setTimeout(runTimePassedUpdater, durationMs);
  }

  return (
    <Column
      as={"custom-post"}
      class={styles.customPost}
      style={{ width: `${props.width}px` }}
    >
      <Row as={"post-title"} class={styles.title}>
        <Img src={props.avatarUrl || DefaultAvatar} />
        <Column flex={"1"}>
          <div class={styles.text}>{props.title}</div>
          <div class={styles.duration}>{timePassed()}</div>
        </Column>
      </Row>
      <Row as={"post-content"} class={styles.content}>
        {contentBody()}
      </Row>
    </Column>
  );
}
