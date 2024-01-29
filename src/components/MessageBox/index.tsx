import "./index.css";
import { DialogResult } from "~/components/MessageBox/store";
import Button from "~/components/common/Button";
import ErrorImage from "~/assets/images/error.png";
import WarningImage from "~/assets/images/warning.png";
import InfoImage from "~/assets/images/info.png";
import SuccessImage from "~/assets/images/success.png";
import QuestionImage from "~/assets/images/question.png";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import Tick from "~/assets/icons/Tick";
import Cross from "~/assets/icons/Cross";
import Dialog from "~/components/common/Dialog";
import { useAppContext } from "~/AppContext";

export default function () {
  const { messageBox, mutateMessageBox } = useAppContext();

  const iconMap = {
    error: ErrorImage,
    warning: WarningImage,
    info: InfoImage,
    success: SuccessImage,
    question: QuestionImage,
  };

  return (
    <Dialog
      id={"message-box"}
      ref={(el) => mutateMessageBox((state) => (state.dialogRef = el))}
    >
      <Column class={"message-box"}>
        <Row class={"title w-full"}>{messageBox.title}</Row>
        <Row class={"gap-2 w-full content"}>
          <img
            src={iconMap[messageBox.type]}
            alt={messageBox.type}
            height={"70px"}
            width={"70px"}
          />
          <p>{messageBox.message}</p>
        </Row>

        <Row class={"controls"}>
          {messageBox.type === "question" ? (
            <>
              <Button
                class={"button-rect green"}
                onClick={async () => messageBox.close(DialogResult.Yes)}
              >
                Yes <Tick />
              </Button>
              <Button
                class={"button-rect red"}
                onClick={async () => messageBox.close(DialogResult.No)}
              >
                No <Cross />
              </Button>
            </>
          ) : (
            <Button
              class={"button-rect green"}
              onClick={async () => messageBox.close(DialogResult.OK)}
            >
              OK <Tick />
            </Button>
          )}
        </Row>
      </Column>
    </Dialog>
  );
}
