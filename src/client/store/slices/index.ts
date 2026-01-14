import { combineReducers } from "redux";
import pagesSlice from "./pagesSlice.ts";

const gameReducer = combineReducers({
    pages: pagesSlice
});

export * from "./pagesSlice.ts";
export default gameReducer;