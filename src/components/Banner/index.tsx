import "./index.css";
import Img from "~/components/common/Img";
import DTULogo from "~/assets/images/dtu-logo.png";
import { For, Show } from "solid-js";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import Column from "~/components/common/Column";
import Button from "~/components/common/Button";
import Logout from "~/assets/icons/Logout";
import { useNavigate } from "@solidjs/router";
import { User } from "~/api/types";

export default function (props: { user?: User }) {
  const { researchGroups, Executor, API } = useAppContext();
  const navigate = useNavigate();

  return (
    <Row class={"banner w-full gap-2"}>
      <Img src={DTULogo} width={50} />
      <Show when={props.user}>
        <Row class={"user"}>
          <Img src={props.user?.photoURL as string}></Img>
          <Column>
            <p>{"Welcome"}</p>
            <p>{props.user?.displayName}</p>
            <Button
              class={"button-rect"}
              onClick={async () => {
                await Executor.run(() => API.AuthService.signOut(), {
                  busyDialogMessage: "Signing out...",
                  postAction: () => navigate("/", {}),
                });
              }}
            >
              <p>Sign Out</p>
              <Logout />
            </Button>
          </Column>
        </Row>
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
