import { push } from "connected-react-router";
import { User } from "oidc-client";
import React from "react";
import { useDispatch } from "react-redux";
import { CallbackComponent } from "redux-oidc";
import userManager from "./userManager";

export default function Callback() {
    const dispatch = useDispatch();

    const successCallback = (user: User) => {
        dispatch(push(user.state.path));
    };

    const errorCallback = (error: Error) => {
        console.error(error);
        dispatch(push("/"));
    };
    return (
        <CallbackComponent
            userManager={userManager}
            successCallback={successCallback}
            errorCallback={errorCallback}
        >
            <div>Redirecting...</div>
        </CallbackComponent>
    );
}
