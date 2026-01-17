import { combineReducers } from "redux";
import pagesSlice from "./pagesSlice.ts";
import homeSlice from "./homeSlice.ts";

const gameReducer = combineReducers({
    pages: pagesSlice,
    home: homeSlice,
});

export * from "./pagesSlice.ts";
export * from "./homeSlice.ts";
export default gameReducer;