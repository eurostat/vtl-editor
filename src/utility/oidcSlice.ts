import { createLogic } from "redux-logic";
import { SILENT_RENEW_ERROR, USER_FOUND } from "redux-oidc";
import { RootState } from "./store";

export const loggedIn = (state: RootState) => !!state.oidc.user;
export const idToken = (state: RootState) => state.oidc.user?.id_token || "";
export const accessToken = (state: RootState) => state.oidc.user?.access_token || "";
export const userName = (state: RootState) => state.oidc.user?.profile.name || "";

export const declassifyUser = createLogic({
    type: [USER_FOUND, SILENT_RENEW_ERROR],
    transform({getState, action}, next) {
        next({
            ...action,
            payload: JSON.parse(JSON.stringify((action as any).payload))
        });
    }
});