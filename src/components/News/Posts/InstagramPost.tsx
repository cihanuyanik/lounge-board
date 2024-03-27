import styles from "./posts.module.scss";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Row from "~/components/common/Flex/Row";
import Img from "~/components/common/Img";
import InstagramPostImage from "~/assets/images/instagram.png";

type InstagramPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function InstagramPost(props: InstagramPostProps) {
  return (
    <div class={`${styles.postContainer} ${styles.instagram}`}>
      <IFramePost
        baseUrl={"instagram.com"}
        expInternalType={"blockquote"}
        {...props}
      />
      <Row class={styles.logo}>
        <Img src={InstagramPostImage}></Img>
      </Row>
    </div>
  );
}
