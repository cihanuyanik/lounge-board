import "./index.css";
import Img from "~/components/common/Img";
import DTULogo from "~/assets/images/dtu-logo.png";
import { createMemo, For, onMount, Show } from "solid-js";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";
import Column from "~/components/common/Column";
import Button from "~/components/common/Button";
import Logout from "~/assets/icons/Logout";
import { useNavigate } from "@solidjs/router";
import { User } from "~/api/types";
import Settings from "~/assets/icons/Settings";
import { useTimer } from "~/utils/utils";
import Avatar from "~/components/common/Avatar";

type BannerProps = {
  title: string;
  user?: User;
  showResearchGroups?: boolean;
};

export default function (props: BannerProps) {
  return (
    <Row class={"banner w-full gap-2"}>
      <Logo />
      <AdminUser user={props.user} />
      <BannerText title={props.title} />
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
        <Avatar imgSrc={props.user?.photoURL!} />
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

function BannerText(props: { title: string }) {
  const { isAdmin } = useAppContext();

  // convert string into character array
  const titleAsArray = createMemo(() => {
    // Get character array as each character is a separate string
    let charArray = props.title.split("");
    // Handle space characters
    return charArray.map((char) => (char === " " ? "\u00A0" : char));
  });

  const timer = useTimer({
    handler: () => {
      bannerTextContainer.classList.contains("animate-letter-jump")
        ? bannerTextContainer.classList.remove("animate-letter-jump")
        : bannerTextContainer.classList.add("animate-letter-jump");
    },
    type: "interval",
    delayMs: 5000, // Half of the color transition time
  });

  onMount(() => {
    if (!isAdmin()) {
      timer.start();
    }
  });

  let bannerTextContainer: HTMLDivElement = null!;

  return (
    <Row ref={bannerTextContainer} class={"banner-text animate-letter-jump"}>
      <For each={titleAsArray()}>
        {(char, index) => (
          <span
            style={{
              "animation-delay": `${index() * 0.25}s`,
            }}
          >
            {char}
          </span>
        )}
      </For>
    </Row>
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
