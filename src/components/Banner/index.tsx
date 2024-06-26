import styles from "./index.module.scss";
import Img from "~/components/common/Img";
import DTULogo from "~/assets/images/dtu-logo.png";
import { createMemo, For, onMount, Show } from "solid-js";
import { useAppContext } from "~/AppContext";
import Button from "~/components/common/Button";
import Logout from "~/assets/icons/Logout";
import { useNavigate } from "@solidjs/router";
import { User } from "~/api/types";
import Settings from "~/assets/icons/Settings";
import { useTimer } from "~/utils/utils";
import Avatar from "~/components/common/Avatar";
import Row from "~/components/common/Flex/Row";
import Column from "~/components/common/Flex/Column";

type BannerProps = {
  title: string;
  user?: User;
  showResearchGroups?: boolean;
};

export default function Banner(props: BannerProps) {
  return (
    <Row as={"banner"} class={styles.Banner} justifyContent={"space-between"}>
      <Logo />
      <AdminUser user={props.user} />
      <BannerText title={props.title} />
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
      class={styles.logo}
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
      <Row as={"admin-user"} class={styles.user}>
        <Avatar imgSrc={props.user?.photoURL!} class={styles.avatar} />
        <Column as={"user-info"}>
          <p>{"Welcome"}</p>
          <p>{props.user?.displayName}</p>
          <Row as={"action-buttons"} gap={"1"}>
            <Button
              popupContent={"Sign out from admin account and go to index page"}
              onClick={async () => {
                await Executor.run(() => API.AuthService.signOut(), {
                  busyDialogMessage: "Signing out...",
                  postAction: () => navigate("/"),
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
      bannerTextContainer.classList.contains(styles.animateLetterJump)
        ? bannerTextContainer.classList.remove(styles.animateLetterJump)
        : bannerTextContainer.classList.add(styles.animateLetterJump);
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
    <Row
      as={"banner-text"}
      ref={bannerTextContainer}
      flex={"1"}
      classList={{
        [styles.bannerText]: true,
        [styles.animateLetterJump]: true,
      }}
    >
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
      <Row as={"research-groups"} class={styles.researchGroupImages}>
        <For each={researchGroups.ids}>
          {(id) => (
            <Img
              src={researchGroups.entities[id].bannerImage}
              classList={{
                [styles.active]: researchGroups.active.id === id,
              }}
            />
          )}
        </For>
      </Row>
    </Show>
  );
}
