import SelectCharacterBox from './CharacterBox/CharacterBox';
import styles from './SelectCharacterContainer.module.scss';

export default function SelectCharacterContainer() {
  return (
    <div className={styles["select-character-container"]}>
      <SelectCharacterBox hero="Avoider" boxColor="hsl(270 45% 30%)" circleColor="hsl(270 45% 20%)" />
 {/*  <SelectCharacterBox hero="Runner" boxColor="hsl(220 45% 30%)" circleColor="hsl(220 45% 20%)" />
      <SelectCharacterBox hero="Chaser" boxColor="hsl(180 45% 25%)" circleColor="hsl(180 45% 15%)" />
      <SelectCharacterBox hero="Defender" boxColor="hsl(140 40% 25%)" circleColor="hsl(140 40% 15%)" />
      <SelectCharacterBox hero="Attacker" boxColor="hsl(80 40% 25%)" circleColor="hsl(80 40% 15%)" />
      <SelectCharacterBox hero="Supporter" boxColor="hsl(40 45% 25%)" circleColor="hsl(40 45% 15%)" />
      <SelectCharacterBox hero="Scavenger" boxColor="hsl(20 45% 30%)" circleColor="hsl(20 45% 20%)" />
      <SelectCharacterBox hero="Sniper" boxColor="hsl(0 45% 30%)" circleColor="hsl(0 45% 20%)" />
      <SelectCharacterBox hero="Medic" boxColor="hsl(330 45% 30%)" circleColor="hsl(330 45% 20%)" />
      <SelectCharacterBox hero="Engineer" boxColor="hsl(290 45% 30%)" circleColor="hsl(290 45% 20%)" />
      <SelectCharacterBox hero="Infiltrator" boxColor="hsl(240 15% 30%)" circleColor="hsl(240 15% 20%)" /> */}
</div>
  );
}