import "./posts.css";
import IFramePost, {
  IFramePostProps,
} from "~/components/News/Posts/IFramePost";
import Img from "~/components/common/Img";
import LinkedInPostImage from "~/assets/images/linkedin.png";
import Row from "~/components/common/Row";

type LinkedInPostProps = Omit<IFramePostProps, "baseUrl" | "expInternalType">;

export default function LinkedInPost(props: LinkedInPostProps) {
  return (
    <div class={"post-container linkedin"}>
      <IFramePost
        baseUrl={"linkedin.com"}
        expInternalType={"iframe"}
        {...props}
      />
      <Row class={"logo"}>
        <Img src={LinkedInPostImage}></Img>
      </Row>
    </div>
  );
}
