import {EditorStorage} from "../editor/EditorStorage";
import {SdmxStorage} from "../sdmx/SdmxStorage";

export const setEditorStorageValue = (object: EditorStorage) => {
    setToLocalStorage("editor", {...getEditorStoredValues(), ...object});
}

export const getEditorStoredValues = (): EditorStorage => {
    return getFromLocalStorage("editor") || {};
}

export const setSdmxStorageValue = (object: SdmxStorage | undefined) => {
    setToLocalStorage("sdmx", object);
}
export const getSdmxStoredValues = (): SdmxStorage => {
    return getFromLocalStorage("sdmx") || {};
}

const getFromLocalStorage = (key: string): any | undefined => {
    const result = window.localStorage.getItem(key);
    return result ? JSON.parse(result) : undefined;
}

const setToLocalStorage = (key: string, value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
}



