import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from "history";
import { createLogicMiddleware } from "redux-logic";
import { loadUser, reducer as oidcReducer } from "redux-oidc";
import controlReducer from "../control/controlSlice";
import editorReducer from "../editor/editorSlice";
import viewReducer from "../main-view/viewSlice";
import repositoryReducer from "../repository/repositorySlice";
import { declassifyUser } from "./oidcSlice";
import userManager from "./userManager";

export const browserHistory = createBrowserHistory({
    basename: process.env.REACT_APP_ROUTER_BASE || ''
});

const rootReducer = combineReducers({
    control: controlReducer,
    editor: editorReducer,
    view: viewReducer,
    repository: repositoryReducer,
    oidc: oidcReducer,
    router: connectRouter(browserHistory),
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware: any) => getDefaultMiddleware()
        .prepend([createLogicMiddleware([declassifyUser])])
        .concat([routerMiddleware(browserHistory)]),
});

loadUser(store, userManager).then(() => {
});

export function readState<TSelected = unknown>(selector: (state: RootState) => TSelected): TSelected {
    return selector(store.getState());
}

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export default store;