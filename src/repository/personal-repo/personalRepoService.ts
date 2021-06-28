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
    try {
        const response = await sendGetRequest(`${REPO_URL}/folders/${folderId}`);
        if (response && response.data) return response.data as StoredItemTransfer;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function getFolderContents(folderId?: number) {
    try {
        const response = folderId
            ? await sendGetRequest(`${REPO_URL}/folders/${folderId}/contents`)
            : await sendGetRequest(REPO_URL);
        if (response && response.data) return response.data;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function createFolder(payload: StoredItemPayload) {
    try {
        const response = await sendPostRequest(`${REPO_URL}/folders`, payload,
            undefined, {"Content-Type": "application/json"});
        if (response && response.data) return response.data as StoredItemTransfer;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function getFile(fileId: number) {
    try {
        const response = await sendGetRequest(`${REPO_URL}/files/${fileId}`);
        if (response && response.data) return response.data as StoredItemTransfer;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function createFile(payload: StoredItemPayload) {
    try {
        const response = await sendPostRequest(`${REPO_URL}/files`, payload,
            undefined, {"Content-Type": "application/json"});
        if (response && response.data) return response.data as StoredItemTransfer;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function updateFile(payload: StoredItemPayload) {
    return sendPutRequest(`${REPO_URL}/files`, payload,
        undefined, {"Content-Type": "application/json"});
}

export async function getFileContent(fileId: number) {
    try {
        const response = await sendGetRequest(`${REPO_URL}/files/${fileId}/content`);
        if (response && response.data) {
            const content = atob(response.data.content);
            if (content !== undefined) return content;
        }
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function updateFileContent(file: EditorFile) {
    const payload = {
        optLock: file.optLock,
        content: btoa(file.content)
    } as ScriptContentPayload;
    try {
        const response = await sendPutRequest(`${REPO_URL}/files/${file.id}/content`, payload,
            undefined, {"Content-Type": "application/json"});
        if (response && response.data) return response.data;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function getFileVersions(fileId: number) {
    try {
        const response = await sendGetRequest(`${REPO_URL}/files/${fileId}/versions`);
        if (response && response.data) return response.data;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function getVersionContent(file: StoredItemTransfer, versionId: string) {
    try {
        const response = await sendGetRequest(`${REPO_URL}/files/${file.id}/versions/${versionId}`);
        if (response && response.data) {
            const content = atob(response.data.content);
            if (content !== undefined) return content;
        }
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function restoreFileVersion(fileId: number, versionId: string, payload: { optLock: number }) {
    try {
        const response = await sendPutRequest(`${REPO_URL}/files/${fileId}/versions/${versionId}/restore`,
            payload, undefined, {"Content-Type": "application/json"});
        if (response && response.data) return response.data;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function updateItem(payload: StoredItemPayload, type: StoredItemType) {
    try {
        let response;
        switch (type) {
            case StoredItemType.FOLDER: {
                response = await sendPutRequest(`${REPO_URL}/folders`, payload,
                    undefined, {"Content-Type": "application/json"});
                break;
            }
            case StoredItemType.FILE: {
                response = await sendPutRequest(`${REPO_URL}/files`, payload,
                    undefined, {"Content-Type": "application/json"});
                break;
            }
        }
        if (response && response.data) return response.data as StoredItemTransfer;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function incrementFileVersion(item: StoredItemTransfer, payload: IncrementVersionPayload) {
    if (item.type === StoredItemType.FILE) {
        try {
            const response = await sendPutRequest(`${REPO_URL}/files/${item.id}/versions/increment`,
                payload, undefined, {"Content-Type": "application/json"})
            if (response && response.data) return response.data;
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function publishFile(payload: StoredItemPayload, type: StoredItemType) {
    if (type === StoredItemType.FILE) {
        try {
            const response = await sendPostRequest(`${REPO_URL}/files/${payload.id}/publish/${payload.parentId}`,
                {name: payload.name}, undefined, {"Content-Type": "application/json"});
            if (response && response.data) return response.data as StoredItemTransfer;
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
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
