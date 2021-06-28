import {credentialsDialog, CredentialsDialogResult} from "./credentialsDialog";
import {clearSessionStorage, fromSessionStorage, toSessionStorage} from "../utility/browserStorage";
import {CredentialsPayload} from "./credentialsPayload";
import {useDispatch} from "react-redux";
import {credentialsChecked} from "./editClientSlice";
import {useCallback} from "react";

const EDIT_WS = "edit_ws";

export function useValidateEditCredentials() {
    const dispatch = useDispatch();
    return useCallback(() => {
        const credentials = loadEditCredentials();
        const validation = validateEditCredentials(credentials);
        dispatch(credentialsChecked(validation));
        return validation ? credentials : undefined;
    }, [dispatch])
}

export function useProvideEditCredentials() {
    const dispatch = useDispatch();
    return useCallback(() => {
        const current = loadEditCredentials();
        enterCredentialsDialog(current)
            .then((credentials) => {
                const validation = validateEditCredentials(credentials);
                dispatch(credentialsChecked(validation));
            })
            .catch(() => {
                const validation = validateEditCredentials(current);
                dispatch(credentialsChecked(validation));
            });
    }, [dispatch]);
}

export function useClearEditCredentials() {
    const dispatch = useDispatch();
    return useCallback(() => {
        clearEditCredentials();
        dispatch(credentialsChecked(false));
    }, [dispatch])
}

export function getEditCredentials() {
    let credentials = loadEditCredentials();
    if (!validateEditCredentials(credentials)) {
        return enterCredentialsDialog(credentials);
    }
    return Promise.resolve(credentials);
}

function loadEditCredentials(): CredentialsPayload {
    return fromSessionStorage(EDIT_WS);
}

function clearEditCredentials() {
    clearSessionStorage(EDIT_WS);
}

function validateEditCredentials(credentials: CredentialsPayload) {
    return !!credentials && !!credentials.username && !!credentials.password && !!credentials.domain;
}

function enterCredentialsDialog(credentials: CredentialsDialogResult) {
    const decision = async () => {
        const result: CredentialsDialogResult | undefined = await credentialsDialog({
            title: "EDIT Service Credentials",
            text: `You need to provide user credentials to access EDIT service.\nEnter your login, password, and domain.`,
            defaultValue: credentials || {},
        });
        if (result) {
            toSessionStorage(EDIT_WS, result);
            return Promise.resolve(result);
        } else {
            return Promise.reject();
        }
    }
    return decision();
}
