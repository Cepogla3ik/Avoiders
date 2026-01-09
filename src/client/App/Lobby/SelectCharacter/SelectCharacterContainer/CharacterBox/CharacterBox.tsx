import styles from './CharacterBox.module.scss';
interface SelectCharacterBoxProps {
  hero: string;
  boxColor: string;
  circleColor: string;
}

export default function SelectCharacterBox({ hero, boxColor, circleColor }: SelectCharacterBoxProps) {
  return (
    <div className={styles["character-box"]} style={{ backgroundColor: boxColor, borderColor: circleColor }}>
      <div className={styles["character-hero"]} style={{ color: circleColor }}>{hero}</div>
      <div className={styles["character-circle"]} style={{ backgroundColor: circleColor }}  ></div>
    </div>
  );
}