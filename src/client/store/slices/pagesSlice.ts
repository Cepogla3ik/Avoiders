import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PagesState {
    game: boolean;
    home: boolean;
    sellectCharacter: boolean;
}

const initialState: PagesState = {
    game: false,
    home: false,
    sellectCharacter: false,
};

const pagesSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setPagesState: (state, action: PayloadAction<Partial<PagesState>>) => {
            state.game = action.payload.game ?? state.game;
            state.home = action.payload.home ?? state.home;
        }
    }
});

export const { setPagesState } = pagesSlice.actions;
export default pagesSlice.reducer;