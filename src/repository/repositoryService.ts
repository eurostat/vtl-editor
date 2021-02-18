import { EditorFile } from "../editor/editorFile";
import { sendDeleteRequest, sendGetRequest, sendPostRequest, sendPutRequest } from '../web-api/apiService';
import { ScriptContentPayload } from "./entity/scriptContentPayload";
import { StoredItemPayload } from "./entity/storedItemPayload";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { StoredItemType } from "./entity/storedItemType";

const BASE_URL = process.env.REACT_APP_API_URL;
const REPO_URL = BASE_URL + "/repo";

export async function getFolder(folderId: number) {
    const response = await sendGetRequest(`${REPO_URL}/folders/${folderId}`);
    if (response && response.data) return response.data as StoredItemTransfer;
    return Promise.reject();
}

export async function getFolderContents(folderId?: number) {
    return folderId
        ? sendGetRequest(`${REPO_URL}/folders/${folderId}/contents`)
        : sendGetRequest(REPO_URL);
}

export async function createFolder(payload: StoredItemPayload) {
    return sendPostRequest(`${REPO_URL}/folders`, payload, "application/json");
}

export async function getFile(fileId: number) {
    const response = await sendGetRequest(`${REPO_URL}/files/${fileId}`);
    if (response && response.data) return response.data as StoredItemTransfer;
    return Promise.reject();
}

export async function createFile(payload: StoredItemPayload) {
    return sendPostRequest(`${REPO_URL}/files`, payload, "application/json");
}

export async function updateFile(payload: StoredItemPayload) {
    return sendPutRequest(`${REPO_URL}/files`, payload, "application/json");
}

export async function getFileContent(fileId: number) {
    const response = await sendGetRequest(`${REPO_URL}/files/${fileId}/content`);
    if (response && response.data) {
        const content = atob(response.data.content);
        if (content !== undefined) return content;
    }
    return Promise.reject();
}

export async function updateFileContent(file: EditorFile) {
    const payload = {
        version: file.version,
        content: btoa(file.content)
    } as ScriptContentPayload;
    return sendPutRequest(`${REPO_URL}/files/${file.remoteId}/content`, payload, "application/json");
}

export async function getFileVersions(fileId: number) {
    return sendGetRequest(`${REPO_URL}/files/${fileId}/versions`);
}

export async function getVersionContent(fileId: number, versionId: number) {
    const response = await sendGetRequest(`${REPO_URL}/files/${fileId}/versions/${versionId}`);
    if (response && response.data) {
        const content = atob(response.data.content);
        if (content !== undefined) return content;
    }
    return Promise.reject();
}

export async function restoreFileVersion(fileId: number, versionId: number, payload: { version: number }) {
    const response = await sendPutRequest(`${REPO_URL}/files/${fileId}/versions/${versionId}/restore`,
        payload, "application/json");
    if (response && response.data) return response.data;
    return Promise.reject();
}

export async function updateItem(payload: StoredItemPayload, type: StoredItemType) {
    switch (type) {
        case StoredItemType.FOLDER: {
            return sendPutRequest(`${REPO_URL}/folders`, payload, "application/json");
        }
        case StoredItemType.FILE: {
            return sendPutRequest(`${REPO_URL}/files`, payload, "application/json");
        }
        default: {
            return Promise.reject();
        }
    }
}

export async function deleteItem(payload: StoredItemPayload, type: StoredItemType) {
    switch (type) {
        case StoredItemType.FOLDER: {
            return sendDeleteRequest(`${REPO_URL}/folders/${payload.id}`);
        }
        case StoredItemType.FILE: {
            return sendDeleteRequest(`${REPO_URL}/files/${payload.id}`);
        }
        default: {
            return Promise.reject();
        }
    }
}

export async function buildFormData(payload: EditorFile) {
    const formData = new FormData();
    const content = new Blob([payload.content], {type: "text/plain", endings: "native"});
    const arrayContent = await new Promise<ArrayBuffer>((resolve, reject) => {
        let result: ArrayBuffer = new ArrayBuffer(1);
        const reader = new FileReader();
        reader.onloadend = function(event) {
            if (event != null && event.target != null) {
                result = event.target.result as ArrayBuffer;
            }
            resolve(result);
        };
        reader.onerror = function(event) {
            reject(event);
        };
        reader.readAsArrayBuffer(content);
    })
    const byteContent = new Blob([arrayContent], {type: "application/octet-stream"});
    const metadata = new Blob([JSON.stringify({"version": payload.version})], {type: "application/json"});
    formData.append('file', byteContent, payload.name);
    formData.append('uploadInfo', metadata);
    return formData;
}

export async function readBlob(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = (event) => {
            if (event.target != null && event.target.result != null) resolve(event.target.result.toString());
            else reject();
        };
        reader.onerror = () => reject();
        reader.readAsText(blob);
    });
}