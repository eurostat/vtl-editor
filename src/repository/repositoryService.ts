import { EditorFile } from "../editor/editorFile";
import { sendDeleteRequest, sendGetRequest, sendPostRequest, sendPutRequest } from '../web-api/apiService';
import { StoredItemPayload } from "./entity/storedItemPayload";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { StoredItemType } from "./entity/storedItemType";

const BASE_URL = process.env.REACT_APP_API_URL;
export const REPO_URL = BASE_URL + "/repo";

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
    const response = await sendGetRequest(`${REPO_URL}/files/${fileId}/content`, "application/octet-stream");
    if (response.data) {
        const content = await readBlob(response.data);
        if (content !== undefined) return content;
    }
    return Promise.reject();
}

export async function updateFileContent(payload: EditorFile) {
    const formData = new FormData();
    const content = new Blob([payload.content], {type: "plain/text", endings: "native"});
    const metadata = new Blob([JSON.stringify({"version": payload.version})], {type: "application/json"});
    formData.append('file', content, payload.name);
    formData.append('uploadInfo', metadata);
    return sendPutRequest(`${REPO_URL}/files/${payload.remoteId}/content`, formData);
}

export async function getFileVersions(fileId: number) {
    return sendGetRequest(`${REPO_URL}/files/${fileId}/versions`);
}

export async function getVersionContent(fileId: number, versionId: number) {
    const response = await sendGetRequest(`${REPO_URL}/files/${fileId}/versions/${versionId}`, "application/octet-stream");
    if (response && response.data) {
        const content = await readBlob(response.data);
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