import { useAppSelector } from "@client/store/store";
import AuthenticationForm from "./AuthenticationForm/AuthenticationForm";
import SelectCharacter from "./SelectCharacter/SelectCharacter";
import styles from "./Home.module.scss";
import Additions from "./Additions/Additions";
import Title from "./Title/Title";
import Lobby from "./Lobby/Lobby";

export default function Home() {
  const { authentication, sellectCharacter, lobby } = useAppSelector((state) => state.game.home);

  function handleContextMenu(e: React.MouseEvent) {
    e.stopPropagation(); 

    if ((e.target as HTMLElement).classList.contains(styles["home"])) {
      e.preventDefault();
    }
  }

  return (
    <div onContextMenu={handleContextMenu} className={styles["home"]}>
      <Title />
      { lobby && <Lobby /> }
      { authentication && <AuthenticationForm /> }
      { sellectCharacter && <SelectCharacter /> }
      { !sellectCharacter && <Additions /> }
    </div>
  );
}