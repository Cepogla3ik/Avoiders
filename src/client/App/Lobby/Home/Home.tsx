import styles from "./Home.module.scss";
import Additions from "./Additions/Additions";
import Form from "./Form/Form";
import Title from "./Title/Title";

export default function Home() {
  return (
    <div onContextMenu={handleContextMenu} className={styles["home"]}>
      <Title />
      <Form />
      <Additions />
    </div>
  );
}

function handleContextMenu(e: React.MouseEvent) {
  e.stopPropagation(); 
    
  if ((e.target as HTMLElement).classList.contains(styles["home"])) {
    e.preventDefault();
  }
}