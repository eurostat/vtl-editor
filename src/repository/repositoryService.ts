import { sendGetRequest, sendPostRequest } from '../web-api/apiService';
import { ScriptFilePayload } from "./entity/scriptFilePayload";
import { StoredFolderPayload } from "./entity/storedFolderPayload";

const BASE_URL = process.env.REACT_APP_API_URL;
export const REPO_URL = BASE_URL + "/repo";

export async function getFolderContents(folderId?: number) {
    return folderId
        ? sendGetRequest(`${REPO_URL}/folders/${folderId}/contents`)
        : sendGetRequest(REPO_URL);
}

export async function createFolder(payload: StoredFolderPayload) {
    return sendPostRequest(`${REPO_URL}/folders`, payload);
}

export async function createFile(payload: ScriptFilePayload) {
    return sendPostRequest(`${REPO_URL}/files`, payload);
}