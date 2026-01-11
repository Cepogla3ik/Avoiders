import Title from "./Lobby/Home/Title/Title";
import Form from "./Lobby/Home/Form/Form";
import Additions from "./Lobby/Home/Additions/Additions";
import Engine from "./Game/Engine/Engine";
import Cursor from "./Cursor/Cursor";

export default function App() {
  return (
    <>
      <Title />
      <Form />
      <Additions />
      <Engine />
      <Cursor />
    </>
  );
}