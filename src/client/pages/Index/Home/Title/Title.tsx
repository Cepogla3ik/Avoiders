import { useAppSelector } from "@client/store/store";
import styles from "./Title.module.scss";

export default function Title() {
  const { authentication, sellectCharacter, lobby } = useAppSelector((state) => state.game.home);

  return <div className={styles["title"]}>
    { lobby && "Avoiders" }
    { authentication && "Authentication" }
    { sellectCharacter && "Select Your Character" }
  </div>;
}