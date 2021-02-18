import { combineReducers, configureStore } from "@reduxjs/toolkit";
import controlReducer from "../control/controlSlice";
import editorReducer from "../editor/editorSlice";
import viewReducer from "../main-view/viewSlice";
import repositoryReducer from "../repository/repositorySlice";

const rootReducer = combineReducers({
    control: controlReducer,
    editor: editorReducer,
    view: viewReducer,
    repository: repositoryReducer
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