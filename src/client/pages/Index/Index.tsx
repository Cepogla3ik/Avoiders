import Cursor from "./Cursor/Cursor";
import Game from "./Game/Game";
import { setHomeState, setPagesState } from "@client/store/slices";
import { useEffect } from "react";
import Home from "./Home/Home";
import { useAppDispatch, useAppSelector, type RootState } from "@client/store/store";

export default function Index() {
  const state = useAppSelector((state: RootState) => state.game.pages);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
      dispatch(setPagesState({ home: true }));
      dispatch(setHomeState({ lobby: true }));
  }, []);

  return (<>
      { state.game && <Game /> }
      { state.home && <Home /> }
      { state.home && <Cursor /> }
  </>
  );
}