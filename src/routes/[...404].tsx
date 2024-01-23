import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import Img from "~/components/common/Img";
import NotFoundImage from "~/assets/images/notfound.webp";

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <div
        class={"app-container"}
        style={{
          background: "#09001f",
        }}
      >
        <Img src={NotFoundImage} />
        <h1
          style={{
            "font-size": "80px",
            position: "absolute",
            top: "20px",
            color: "white",
          }}
        >
          Page Not Found
        </h1>
      </div>
    </main>
  );
}
