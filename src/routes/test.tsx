import { AppContextProvider, useAppContext } from "~/AppContext";
import Button from "~/components/common/Button";
import Row from "~/components/common/Row";

type TestProps = {};

export default function Test(props: TestProps) {
  return (
    <AppContextProvider>
      <_Test {...props} />
    </AppContextProvider>
  );
}

function _Test() {
  const { API } = useAppContext();

  async function loginGoogle() {
    try {
      const userCredential = await API.AuthService.signInWithGoogle();
      const user = userCredential.user;
      console.log("Print user");
      console.log(user);

      console.log("Verified:", API.AuthService.isUserVerified());
    } catch (e) {
      console.log("Error");
      console.error(e);
    }
  }

  async function loginMicrosoft() {
    try {
      const userCredential = await API.AuthService.signInWithMicrosoft();

      const user = userCredential.user;
      console.log("Print user");
      console.log(user);

      console.log("Verified:", API.AuthService.isUserVerified());
    } catch (e) {
      console.log("Error");
      console.error(e);
    }
  }

  async function loginGitHub() {
    try {
      const userCredential = await API.AuthService.signInWithGitHub();
      const user = userCredential.user;
      console.log("Print user");
      console.log(user);

      console.log("Verified:", API.AuthService.isUserVerified());
    } catch (e) {
      console.log("Error");
      console.error(e);
    }
  }

  return (
    <div class={"app-container"}>
      <Row class={"gap-2"} style={{ width: "300px" }}>
        <Button class={"button-rect"} onClick={loginGoogle}>
          Google
        </Button>
        <Button class={"button-rect"} onClick={loginMicrosoft}>
          Microsoft
        </Button>
        <Button class={"button-rect"} onClick={loginGitHub}>
          GitHub
        </Button>
      </Row>
    </div>
  );
}
