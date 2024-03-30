import styles from "./posts.module.scss";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Row from "~/components/common/Flex/Row";
import Img from "~/components/common/Img";
import InstagramPostImage from "~/assets/images/instagram.png";
import { Dynamic } from "solid-js/web";

type InstagramPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function InstagramPost(props: InstagramPostProps) {
  return (
    <Dynamic
      component={"instagram-post"}
      class={`${styles.postContainer} ${styles.instagram}`}
    >
      <IFramePost
        baseUrl={"instagram.com"}
        expInternalType={"blockquote"}
        {...props}
      />
      <Row class={styles.logo}>
        <Img src={InstagramPostImage}></Img>
      </Row>
    </Dynamic>
  );
}
