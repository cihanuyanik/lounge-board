import styles from "./index.module.scss";
import BusyDialogGif from "~/assets/images/busydialog.gif";
import Column from "~/components/common/Column";
import { useAppContext } from "~/AppContext";
import Dialog from "~/components/common/Dialog";

export default function BusyDialog() {
  const { busyDialog, mutateBusyDialog } = useAppContext();

  return (
    <Dialog
      id={"busy-dialog"}
      ref={(el) => mutateBusyDialog((state) => (state.dialogRef = el))}
    >
      <Column class={styles.BusyDialogContent}>
        <img src={BusyDialogGif} alt={"Busy Dialog gif"} />
        <p>{busyDialog.message}</p>
      </Column>
    </Dialog>
  );
}
