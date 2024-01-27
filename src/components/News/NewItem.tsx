import "./news.scss";
import CalendarDate from "~/assets/icons/CalendarDate";
import Clock from "~/assets/icons/Clock";
import { CreateNewsDialogResult } from "~/components/News/CreateEditNews";
import { Accessor, createMemo } from "solid-js";
import Column from "~/components/common/Column";
import Row from "~/components/common/Row";
import { useAppContext } from "~/AppContext";

type Props = {
  id: string;
  index: Accessor<number>;
  editDialog?: HTMLDialogElement;
};

export default function NewItem(props: Props) {
  const { isAdmin, busyDialog, messageBox, news, API } = useAppContext();

  const dateStr = createMemo(() => {
    const date = news.entities[props.id].createdAt.toDate();
    return date.toLocaleDateString("en-UK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  });

  const timeStr = createMemo(() => {
    const date = news.entities[props.id].createdAt.toDate();
    let timeStr: string | undefined = date.toLocaleTimeString("en-UK", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (timeStr === "00:00") timeStr = undefined;

    return timeStr;
  });

  function onClick() {
    const newItem = news.entities[props.id];
    if (newItem.isSelected) news.unselect(props.id);
    else news.select(props.id);
  }

  async function onDoubleClick() {
    if (!props.editDialog) return;
    const dResult = await props.editDialog.ShowModal<CreateNewsDialogResult>(
      news.entities[props.id],
    );
    if (dResult.result === "Cancel") return;

    try {
      busyDialog.show("Updating news...");

      await API.News.update({
        original: news.entities[props.id],
        changes: {
          text: dResult.news.text,
        },
      });

      busyDialog.close();
    } catch (e) {
      busyDialog.close();
      messageBox.error(`${e}`);
    }
  }

  return (
    <Column
      class={"news-item"}
      classList={{
        "item-selected": news.entities[props.id]?.isSelected,
        "cursor-pointer": isAdmin(),
        emphasize: props.index() === 0,
      }}
      onClick={isAdmin() ? onClick : undefined}
      ondblclick={isAdmin() ? onDoubleClick : undefined}
    >
      <Row class={"text"}>{news.entities[props.id].text}</Row>
      <Row class={"time"}>
        <CalendarDate />
        <p>{dateStr()}</p>

        {timeStr() && (
          <>
            <p> --- </p>
            <Clock />
            <p>{timeStr()}</p>
          </>
        )}
      </Row>
    </Column>
  );
}
