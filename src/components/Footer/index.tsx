import styles from "./index.module.scss";
import Email from "~/assets/icons/Email";
import Row from "~/components/common/Flex/Row";

export default function Footer() {
  return (
    <Row as={"footer"} class={styles.Footer}>
      <span>Under Development...</span>
      Please contact Cihan Uyanik, <a> ciuya@dtu.dk </a>
      <Email />, when you observe any bugs and/or if you have suggestions. Thank
      you!
    </Row>
  );
}
