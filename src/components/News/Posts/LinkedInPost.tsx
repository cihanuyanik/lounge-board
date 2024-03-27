import styles from "./posts.module.scss";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Img from "~/components/common/Img";
import LinkedInPostImage from "~/assets/images/linkedin.png";
import Row from "~/components/common/Flex/Row";

type LinkedInPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function LinkedInPost(props: LinkedInPostProps) {
  return (
    <div class={`${styles.postContainer} ${styles.linkedin}`}>
      <IFramePost
        baseUrl={"linkedin.com"}
        expInternalType={"iframe"}
        {...props}
      />
      <Row class={styles.logo}>
        <Img src={LinkedInPostImage}></Img>
      </Row>
    </div>
  );
}
