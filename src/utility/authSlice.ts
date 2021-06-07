import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createLogic } from "redux-logic";
import { SILENT_RENEW_ERROR, USER_FOUND } from "redux-oidc";
import { RootState } from "./store";

const initialState = {
    roles: [],
} as AuthState;

export const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        provideRoles(state, action: PayloadAction<string[]>) {
            state.roles = action.payload;
        },
    }
});

export interface AuthState {
    roles: string[],
}

export const {
    provideRoles
} = authSlice.actions;

export const grantedRoles = (state: RootState) => state.auth.roles;

export default authSlice.reducer;

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