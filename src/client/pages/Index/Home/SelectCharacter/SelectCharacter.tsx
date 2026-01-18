import styles from './SelectCharacter.module.scss';
import SelectCharacterContainer from './SelectCharacterContainer/SelectCharacterContainer';

export default function SelectCharacter() {
  return (
    <div className={styles["select-character"]}>
      <SelectCharacterContainer />
    </div>
  );
}