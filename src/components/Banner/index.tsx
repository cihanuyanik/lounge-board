import "./index.scss";
import Img from "~/components/common/Img";
import DTULogo from "~/assets/images/dtu-logo.png";
import { For, Show } from "solid-js";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import Column from "~/components/common/Column";
import Button from "~/components/common/Button";
import Logout from "~/assets/icons/Logout";
import { API } from "~/api/Firebase";
import { useNavigate } from "@solidjs/router";
import { User } from "~/api/types";

export default function (props: { user?: User }) {
  const { researchGroups, messageBox, busyDialog } = useAppContext();
  const navigate = useNavigate();
  async function onSignOut() {
    try {
      busyDialog.show("Signing out...");
      await API.AuthService.signOut();
      busyDialog.close();
      navigate("/", {});
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  return (
    <Row class={"banner w-full gap-2"}>
      <Img src={DTULogo} width={50} />
      <Show when={props.user}>
        <Column class={"user"}>
          <p>{"Welcome"}</p>
          <p>{props.user?.email}</p>
          <Row class={"w-full"}>
            <Button class={"button-rect"} onClick={onSignOut}>
              Sign Out
              <Logout />
            </Button>
          </Row>
        </Column>
      </Show>
      <Row class={"name flex-1"}>Digital Health</Row>
      <Row class={"group-images gap-4"}>
        <For each={researchGroups.ids}>
          {(id) => <Img src={researchGroups.entities[id].bannerImage} />}
        </For>
      </Row>
    </Row>
  );
}
