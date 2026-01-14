import Home from "./Lobby/Home/Home";
import SelectCharacter from "./Lobby/SelectCharacter/SelectCharacter";
import Cursor from "./Cursor/Cursor";
import { Provider } from "react-redux";
import store, { useAppDispatch, useAppSelector, type RootState } from "@client/store/store";
import Game from "./Game/Game";
import { setPagesState } from "@client/store/slices";
import { useEffect } from "react";

export default function App() {
  const state = useAppSelector((state: RootState) => state.game.pages);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
      dispatch(setPagesState({ lobby: true }));
  }, []);

  return (
    <Provider store={store}>
      { state.game && <Game /> }
      { state.lobby && <Home /> }
      { state.sellectCharacter && <SelectCharacter /> }
      { state.lobby && <Cursor /> }
    </Provider>
  );
}