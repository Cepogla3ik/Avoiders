import { setHomeState } from "@client/store/slices";
import { useAppDispatch } from "@client/store/store";

export default function Lobby() {
  const dispatch = useAppDispatch();
  
  return (<>
    <button onClick={() => dispatch(setHomeState({ sellectCharacter: true, lobby: false }))}>Play</button>
  </>);
}