import { combineReducers, configureStore } from "@reduxjs/toolkit";
import editorReducer from "../editor/editorSlice";
import viewReducer from "../main-view/viewSlice";
import repositoryReducer from "../repository/repositorySlice";

const rootReducer = combineReducers({
    editor: editorReducer,
    repository: repositoryReducer,
    view: viewReducer
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