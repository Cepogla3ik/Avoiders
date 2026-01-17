import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface HomeState {
  lobby: boolean;
  authentication: boolean;
  sellectCharacter: boolean;
}

const initialState: HomeState = {
  lobby: false,
  authentication: false,
  sellectCharacter: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setHomeState: (state, action: PayloadAction<Partial<HomeState>>) => {
      state.lobby = action.payload.lobby ?? state.lobby;
      state.authentication = action.payload.authentication ?? state.authentication;
      state.sellectCharacter = action.payload.sellectCharacter ?? state.sellectCharacter;
    }
  }
});

export const { setHomeState } = homeSlice.actions;
export default homeSlice.reducer;