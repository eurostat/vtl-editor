import {EditorStorage} from "../models/storage/EditorStorage";
import {SdmxStorage} from "../models/storage/SdmxStorage";

export const setEditorStorageValue = (object: EditorStorage) => {
    setToLocalStorage("editor", {...getEditorStoredValues(), ...object});
}

export const getEditorStoredValues = (): EditorStorage => {
    return getFromLocalStorage("editor") || {};
}

export const setSdmxStorageValue = (object: SdmxStorage) => {
    setToLocalStorage("sdmx", {...getSdmxStoredValues(), ...object});
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



