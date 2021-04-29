import {sendDeleteRequest, sendPostRequest} from "../web-api/apiService";
import {CredentialsPayload} from "./credentialsPayload";
import {DatasetDefinitionTransfer} from "./dataset-definition/datasetDefinitionTransfer";
import {ProgramTransfer} from "./program/programTransfer";
import {StoredItemPayload} from "../repository/entity/storedItemPayload";
import {StoredItemType} from "../repository/entity/storedItemType";

export const EDIT_URL = process.env.REACT_APP_API_URL + "/edit";
export const DEFINITION_URL = EDIT_URL + "/definitions";
export const PROGRAM_URL = EDIT_URL + "/programs";

export function getEditCredentials() {
    return {
        username: "",
        password: ""
    } as CredentialsPayload
}


export function buildUrl(path: string, queryParams?: any): string {
    if (!queryParams) return path;
    const url = new URL(path);
    const params = new URLSearchParams();
    const values: { [key: string]: any } = queryParams;
    Object.keys(values).forEach((key) => {
        if (values[key] !== undefined) params.append(key, values[key]);
    })
    url.search = params.toString();
    return url.toString();
}

export async function fetchEntities(url: string, dataField: string) {
    const response = await sendPostRequest(url, getEditCredentials(), "application/json");
    if (response && response.data) {
        return response.data;
    }
    return Promise.reject();
}

export async function fetchDefinitions() {
    return fetchEntities(buildUrl(`${DEFINITION_URL}/list`, {}), "definitions")
        .then((received: DatasetDefinitionTransfer[]) => received);
}

export async function uploadPersonalDefinition(payload: StoredItemPayload, type: StoredItemType) {
    return type === StoredItemType.FILE
        ? sendPostRequest(`${DEFINITION_URL}/files/${payload.id}`,
            getEditCredentials(), "application/json")
        : Promise.reject();
}

export async function uploadDomainDefinition(payload: StoredItemPayload, type: StoredItemType) {
    return type === StoredItemType.FILE
        ? sendPostRequest(`${DEFINITION_URL}/domains/${payload.parentId}/files/${payload.id}`,
            getEditCredentials(), "application/json")
        : Promise.reject();
}

export async function deleteDefinition(definitionId: number) {
    return sendDeleteRequest(`${DEFINITION_URL}/${definitionId}`, getEditCredentials(), "application/json");
}

export async function fetchPrograms() {
    return fetchEntities(buildUrl(`${PROGRAM_URL}/list`, {}), "programs")
        .then((received: ProgramTransfer[]) => received);
}

export async function uploadPersonalProgram(payload: StoredItemPayload, type: StoredItemType) {
    return type === StoredItemType.FILE
        ? sendPostRequest(`${PROGRAM_URL}/files/${payload.id}`,
            getEditCredentials(), "application/json")
        : Promise.reject();
}

export async function uploadDomainProgram(payload: StoredItemPayload, type: StoredItemType) {
    return type === StoredItemType.FILE
        ? sendPostRequest(`${PROGRAM_URL}/domains/${payload.parentId}/files/${payload.id}`,
            getEditCredentials(), "application/json")
        : Promise.reject();
}

export async function deleteProgram(programId: number) {
    return sendDeleteRequest(`${PROGRAM_URL}/${programId}`, getEditCredentials(), "application/json");
}