import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PagesState {
    game: boolean;
    lobby: boolean;
    sellectCharacter: boolean;
}

const initialState: PagesState = {
    game: false,
    lobby: false,
    sellectCharacter: false,
};

const pagesSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setPagesState: (state, action: PayloadAction<Partial<PagesState>>) => {
            state.game = action.payload.game ?? state.game;
            state.lobby = action.payload.lobby ?? state.lobby;
        }
    }
});

export const { setPagesState } = pagesSlice.actions;
export default pagesSlice.reducer;