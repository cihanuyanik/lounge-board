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
      <Logo />
      <AdminUser user={props.user} />
      <Row class={"name"}>{props.title}</Row>
      <Row class={"flex-1"} />
      <ResearchGroups show={props.showResearchGroups} />
    </Row>
  );
}

function Logo() {
  const navigate = useNavigate();
  const { isAdmin } = useAppContext();

  return (
    <Img
      src={DTULogo}
      class={"dtu-logo"}
      onClick={() => {
        !isAdmin() ? navigate("/admin") : navigate("/");
      }}
    />
  );
}

function AdminUser(props: { user?: User }) {
  const navigate = useNavigate();
  const { Executor, API } = useAppContext();

  return (
    <Show when={props.user}>
      <Row class={"user"}>
        <Row class={"avatar"}>
          <Img src={props.user?.photoURL || AvatarPlaceholder}></Img>
        </Row>
        <Column>
          <p>{"Welcome"}</p>
          <p>{props.user?.displayName}</p>
          <Row class={"gap-1"}>
            <Button
              popupContent={"Sign out from admin account and go to index page"}
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
              popupContent={"Go to profile update page"}
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
  );
}

function ResearchGroups(props: { show?: boolean }) {
  const { researchGroups } = useAppContext();

  return (
    <Show when={props.show}>
      <Row class={"group-images gap-4"}>
        <For each={researchGroups.ids}>
          {(id) => (
            <Img
              src={researchGroups.entities[id].bannerImage}
              classList={{
                active: researchGroups.active.id === id,
              }}
            />
          )}
        </For>
      </Row>
    </Show>
  );
}
