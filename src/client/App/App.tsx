import Home from "./Lobby/Home/Home";
import SelectCharacter from "./Lobby/SelectCharacter/SelectCharacter";
import Engine from "./Game/Engine/Engine";
import Cursor from "./Cursor/Cursor";

export default function App() {
  return (
    <>
      <Home />
      <SelectCharacter />
      <Engine />
      <Cursor />
    </>
  );
}