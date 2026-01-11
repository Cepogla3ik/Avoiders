import styles from "./Additions.module.scss";
import Changelog from "./Changelog/Changelog";

export default function Additions() {
  return (
    <div className={styles["additions-container"]}>
      <Changelog />
    </div>
  );
}