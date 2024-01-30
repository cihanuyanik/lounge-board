import "./posts.css";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Img from "~/components/common/Img";
import moment from "moment";
import { createMemo } from "solid-js";
import { Timestamp } from "firebase/firestore";

type CustomPostProps = {
  width: number;
  avatarUrl: string;
  title: string;
  postHtml: string;
  updatedAt: Timestamp;
};

export default function (props: CustomPostProps) {
  const parser = new DOMParser();

  const contentBody = createMemo(() => {
    return parser.parseFromString(props.postHtml || "", "text/html").body;
  });

  const timePassed = createMemo(() => {
    return moment(props.updatedAt.toDate()).fromNow();
  });

  return (
    <Column class={"custom-post"} style={{ width: `${props.width}px` }}>
      <Row class={"custom-post-title"}>
        <Img
          src={
            props.avatarUrl ||
            "https://firebasestorage.googleapis.com/v0/b/digital-health-lounge-board.appspot.com/o/profile-cihan-uyanik-1706345574976?alt=media"
          }
        />
        <Column class={"flex-1"}>
          <div class={"title-text"}>{props.title}</div>
          <div class={"title-duration"}>{timePassed()}</div>
        </Column>
      </Row>
      <Row class={"custom-post-content"}>{contentBody()}</Row>
    </Column>
  );
}
