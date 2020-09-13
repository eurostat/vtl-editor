import { configureStore, combineReducers } from "@reduxjs/toolkit";
import editorReducer from "../editor/editorSlice";
import loaderReducer from "../editor/loaderSlice";

const rootReducer = combineReducers({
    editor: editorReducer,
    loader: loaderReducer
})

const store = configureStore({
    reducer: rootReducer
})

export function readState<TSelected = unknown>(selector: (state: RootState) => TSelected): TSelected {
    return selector(store.getState());
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export default store;