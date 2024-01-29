import "./posts.css";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Row from "~/components/common/Row";
import Img from "~/components/common/Img";
import InstagramPostImage from "~/assets/images/instagram.png";

type InstagramPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function InstagramPost(props: InstagramPostProps) {
  return (
    <div class={"post-container instagram"}>
      <IFramePost
        baseUrl={"instagram.com"}
        expInternalType={"blockquote"}
        {...props}
      />
      <Row class={"logo"}>
        <Img src={InstagramPostImage}></Img>
      </Row>
    </div>
  );
}
