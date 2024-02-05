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
import AvatarPlaceholder from "~/assets/images/member-placeholder.png";
import Settings from "~/assets/icons/Settings";

type BannerProps = {
  title: string;
  user?: User;
  showResearchGroups?: boolean;
};

export default function (props: BannerProps) {
  const { researchGroups, Executor, API, isAdmin } = useAppContext();
  const navigate = useNavigate();

  return (
    <Row class={"banner w-full gap-2"}>
      <Img
        src={DTULogo}
        class={"dtu-logo"}
        onClick={() => {
          !isAdmin() ? navigate("/admin") : navigate("/");
        }}
      />

      <Show when={props.user}>
        <Row class={"user"}>
          <Img src={props.user?.photoURL || AvatarPlaceholder}></Img>
          <Column>
            <p>{"Welcome"}</p>
            <p>{props.user?.displayName}</p>
            <Row class={"gap-1"}>
              <Button
                onClick={async () => {
                  await Executor.run(() => API.AuthService.signOut(), {
                    busyDialogMessage: "Signing out...",
                    postAction: () => navigate("/", {}),
                  });
                }}
              >
                Out
                <Logout />
              </Button>
              <Button
                onClick={() => {
                  navigate("/profile");
                }}
              >
                <Settings />
              </Button>
            </Row>
          </Column>
        </Row>
      </Show>
      <Row class={"name"}>{props.title}</Row>
      <Row class={"flex-1"} />
      <Show when={props.showResearchGroups}>
        <Row class={"group-images gap-4"}>
          <For each={researchGroups.ids}>
            {(id) => <Img src={researchGroups.entities[id].bannerImage} />}
          </For>
        </Row>
      </Show>
    </Row>
  );
}
