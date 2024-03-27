import styles from "./posts.module.scss";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Row from "~/components/common/Flex/Row";
import Img from "~/components/common/Img";
import FacebookPostImage from "~/assets/images/facebook.png";

type FacebookPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function FacebookPost(props: FacebookPostProps) {
  return (
    <div class={`${styles.postContainer} ${styles.facebook}`}>
      <IFramePost
        baseUrl={"facebook.com"}
        expInternalType={"iframe"}
        {...props}
      />
      <Row class={styles.logo}>
        <Img src={FacebookPostImage}></Img>
      </Row>
    </div>
  );
}
