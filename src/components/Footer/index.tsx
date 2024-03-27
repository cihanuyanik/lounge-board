import styles from "./index.module.scss";
import Email from "~/assets/icons/Email";

export default function Footer() {
  return (
    <div class={styles.Footer}>
      <span>Under Development...</span>
      Please contact Cihan Uyanik, <a> ciuya@dtu.dk </a>
      <Email />, when you observe any bugs and/or if you have suggestions. Thank
      you!
    </div>
  );
}
