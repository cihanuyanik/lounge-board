import styles from "./posts.module.scss";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Row from "~/components/common/Flex/Row";
import Img from "~/components/common/Img";
import TwitterPostImage from "~/assets/images/twitter.png";
import { Dynamic } from "solid-js/web";

type TwitterPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function TwitterPost(props: TwitterPostProps) {
  return (
    <Dynamic
      component={"twitter-post"}
      class={`${styles.postContainer} ${styles.twitter}`}
    >
      <IFramePost
        baseUrl={"twitter.com"}
        expInternalType={"blockquote"}
        {...props}
      />
      <Row class={styles.logo}>
        <Img src={TwitterPostImage}></Img>
      </Row>
    </Dynamic>
  );
}
