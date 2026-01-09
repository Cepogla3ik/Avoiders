import styles from './SelectCharacter.module.scss';
import SelectCharacterContainer from './SelectCharacterContainer/SelectCharacterContainer';
import SelectCharacterTitle from './SelectCharacterTitle/SelectCharacterTitle';

export default function SelectCharacter() {
  return (
    <div onContextMenu={handleContextMenu} className={styles["select-character"]}>
      <SelectCharacterTitle />
      <SelectCharacterContainer />
    </div>
  );
}

function handleContextMenu(e: React.MouseEvent) {
  e.stopPropagation(); 
    
  if ((e.target as HTMLElement).classList.contains(styles["select-character"])) {
    e.preventDefault();
  }
}