import {EditorFile} from "../../editor/editorFile";
import {sendDeleteRequest, sendGetRequest, sendPostRequest, sendPutRequest} from '../../web-api/apiService';
import {ScriptContentPayload} from "../entity/scriptContentPayload";
import {StoredItemPayload} from "../entity/storedItemPayload";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {StoredItemType} from "../entity/storedItemType";
import {IncrementVersionPayload} from "../entity/incrementVersionPayload";

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
    return sendPostRequest(`${REPO_URL}/folders`, payload,
        undefined, {"Content-Type": "application/json"});
}

export async function getFile(fileId: number) {
    const response = await sendGetRequest(`${REPO_URL}/files/${fileId}`);
    if (response && response.data) return response.data as StoredItemTransfer;
    return Promise.reject();
}

export async function createFile(payload: StoredItemPayload) {
    return sendPostRequest(`${REPO_URL}/files`, payload,
        undefined, {"Content-Type": "application/json"});
}

export async function updateFile(payload: StoredItemPayload) {
    return sendPutRequest(`${REPO_URL}/files`, payload,
        undefined, {"Content-Type": "application/json"});
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
        optLock: file.optLock,
        content: btoa(file.content)
    } as ScriptContentPayload;
    return sendPutRequest(`${REPO_URL}/files/${file.id}/content`, payload,
        undefined, {"Content-Type": "application/json"});
}

export async function getFileVersions(fileId: number) {
    return sendGetRequest(`${REPO_URL}/files/${fileId}/versions`);
}

export async function getVersionContent(file: StoredItemTransfer, versionId: string) {
    const response = await sendGetRequest(`${REPO_URL}/files/${file.id}/versions/${versionId}`);
    if (response && response.data) {
        const content = atob(response.data.content);
        if (content !== undefined) return content;
    }
    return Promise.reject();
}

export async function restoreFileVersion(fileId: number, versionId: string, payload: { optLock: number }) {
    const response = await sendPutRequest(`${REPO_URL}/files/${fileId}/versions/${versionId}/restore`,
        payload, undefined, {"Content-Type": "application/json"});
    if (response && response.data) return response.data;
    return Promise.reject();
}

export async function updateItem(payload: StoredItemPayload, type: StoredItemType) {
    switch (type) {
        case StoredItemType.FOLDER: {
            return sendPutRequest(`${REPO_URL}/folders`, payload,
                undefined, {"Content-Type": "application/json"});
        }
        case StoredItemType.FILE: {
            return sendPutRequest(`${REPO_URL}/files`, payload,
                undefined, {"Content-Type": "application/json"});
        }
        default: {
            return Promise.reject();
        }
    }
}

export async function incrementFileVersion(item: StoredItemTransfer, payload: IncrementVersionPayload) {
    return item.type === StoredItemType.FILE
        ? sendPutRequest(`${REPO_URL}/files/${item.id}/versions/increment`,
            payload, undefined, {"Content-Type": "application/json"})
        : Promise.reject();
}

export async function publishFile(payload: StoredItemPayload, type: StoredItemType) {
    return type === StoredItemType.FILE
        ? sendPostRequest(`${REPO_URL}/files/${payload.id}/publish/${payload.parentId}`,
            {name: payload.name}, undefined, {"Content-Type": "application/json"})
        : Promise.reject();
}

export async function deleteItem(payload: StoredItemPayload, type: StoredItemType) {
    switch (type) {
        case StoredItemType.FOLDER: {
            return sendDeleteRequest(`${REPO_URL}/folders/${payload.id}`);
        }
        case StoredItemType.FILE: {
            return sendDeleteRequest(`${REPO_URL}/files/${payload.id}`,
                {optLock: payload.optLock}, undefined,
                {"Content-Type": "application/json"});
        }
        default: {
            return Promise.reject();
        }
    }
}
