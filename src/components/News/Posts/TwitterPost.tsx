import styles from "./posts.module.scss";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Row from "~/components/common/Row";
import Img from "~/components/common/Img";
import TwitterPostImage from "~/assets/images/twitter.png";

type TwitterPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function TwitterPost(props: TwitterPostProps) {
  return (
    <div class={`${styles.postContainer} ${styles.twitter}`}>
      <IFramePost
        baseUrl={"twitter.com"}
        expInternalType={"blockquote"}
        {...props}
      />
      <Row class={styles.logo}>
        <Img src={TwitterPostImage}></Img>
      </Row>
    </div>
  );
}
