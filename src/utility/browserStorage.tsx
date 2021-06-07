import React, {memo, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {EditorFile} from "../editor/editorFile";
import {appliedVtlVersion, changeVtlVersion, editorFile, storeLoaded} from "../editor/editorSlice";
import {appliedTheme, changeTheme, detailPaneVisible, showDetailPane} from "../main-view/viewSlice";
import {SdmxStorage} from "../sdmx/SdmxStorage";
import {Log} from "./log";

export enum StorageKey {
    EDITOR = "editor",
    SDMX = "sdmx",
    VIEW = "view"
}

const BrowserStorage = () => {
    const storageLoaded = useRef<boolean>(false);
    const dispatch = useDispatch();
    const editedFile = useSelector(editorFile);
    const vtlVersion = useSelector(appliedVtlVersion);
    const detailPane = useSelector(detailPaneVisible);
    const theme = useSelector(appliedTheme);

    useEffect(() => {
        if (!storageLoaded.current) {
            Log.info("Loading state from browser local storage.", "BrowserStorage");
            let storedValues = fromLocalStorage(StorageKey.EDITOR);
            if (storedValues.file) {
                const storedFile: EditorFile = storedValues.file;
                dispatch(storeLoaded(storedFile));
            }
            if (storedValues.vtlVersion) dispatch(changeVtlVersion(storedValues.vtlVersion));
            storedValues = fromLocalStorage(StorageKey.VIEW);
            if (storedValues.detailPaneVisible) dispatch(showDetailPane(storedValues.detailPaneVisible));
            if (storedValues.theme) dispatch(changeTheme(storedValues.theme));
            storageLoaded.current = true;
        }
    }, [dispatch]);

    useEffect(() => {
        if (storageLoaded.current) {
            toLocalStorage(StorageKey.EDITOR, {
                ...fromLocalStorage(StorageKey.EDITOR),
                file: editedFile,
                vtlVersion: vtlVersion
            });
            toLocalStorage(StorageKey.VIEW, {
                ...fromLocalStorage(StorageKey.VIEW),
                detailPaneVisible: detailPane,
                theme: theme
            });
        }
    }, [editedFile, vtlVersion, detailPane, theme])

    return (
        <></>
    );
}

export const setSdmxStorageValue = (object: SdmxStorage | undefined) => {
    toLocalStorage(StorageKey.SDMX, object);
}
export const getSdmxStoredValues = (): SdmxStorage => {
    return fromLocalStorage(StorageKey.SDMX) || {};
}

const fromLocalStorage = (key: string): any => {
    const result = window.localStorage.getItem(key);
    return result ? JSON.parse(result) : {};
}

const toLocalStorage = (key: string, value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
}

export function fromSessionStorage(key: string): any {
    const result = sessionStorage.getItem(key);
    return result ? JSON.parse(result) : undefined;
}

export function toSessionStorage(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearSessionStorage(key: string) {
    sessionStorage.removeItem(key);
}

export default memo(BrowserStorage);

