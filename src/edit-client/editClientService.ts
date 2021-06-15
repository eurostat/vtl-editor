import {sendDeleteRequest, sendGetRequest, sendPostRequest} from "../web-api/apiService";
import {DatasetDefinitionTransfer} from "./dataset-definition/datasetDefinitionTransfer";
import {ProgramTransfer} from "./program/programTransfer";
import {StoredItemType} from "../repository/entity/storedItemType";
import {CredentialsPayload} from "./credentialsPayload";
import {convertEntityDates} from "../web-api/apiUtility";
import {StoredItemTransfer} from "../repository/entity/storedItemTransfer";
import _ from "lodash";

export const EDIT_URL = process.env.REACT_APP_API_URL + "/edit";
export const DEFINITION_URL = EDIT_URL + "/definitions";
export const PROGRAM_URL = EDIT_URL + "/programs";

export function buildCredentialsHeader(credentials: CredentialsPayload) {
    return {
        "edit-ws-username": credentials.username,
        "edit-ws-password": credentials.password,
        "edit-ws-domain": credentials.domain
    }
}

async function fetchEditEntities(url: string, credentials: CredentialsPayload) {
    try {
        const response = await  sendGetRequest(url, undefined, buildCredentialsHeader(credentials));
        if (response && response.data) {
            return response.data.map((definition: DatasetDefinitionTransfer) => convertEntityDates(definition)) as any[];
        }
        return Promise.reject();
    } catch(response) {
        return Promise.reject(response.error)
    }
}

async function uploadEditEntity(url: string, item: StoredItemTransfer, domainId: number | undefined, credentials: CredentialsPayload) {
    if (item.type !== StoredItemType.FILE) return Promise.reject();
    const payload = {
        fileId: item.id,
        domainId: domainId,
        programName: item.name
    }
    const header = _.merge(buildCredentialsHeader(credentials), {"Content-Type": "application/json"});
    try {
        const response = await sendPostRequest(`${url}/files/${item.id}`, payload, undefined, header);
        if (response && response.success) return response.success;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

async function deleteEditEntity(url: string, credentials: CredentialsPayload) {
    try {
        const response = await sendDeleteRequest(url, undefined,
            undefined, buildCredentialsHeader(credentials));
        if (response && response.success) return response.success;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export function fetchEditDefinitions(credentials: CredentialsPayload) {
    return fetchEditEntities(DEFINITION_URL, credentials)
        .then((data) => {
            return data as DatasetDefinitionTransfer[];
        });
}

export function uploadEditDefinition(item: StoredItemTransfer, domainId: number | undefined, credentials: CredentialsPayload) {
    return uploadEditEntity(DEFINITION_URL, item, domainId, credentials);
}

export function deleteEditDefinition(definitionId: number, credentials: CredentialsPayload) {
    return deleteEditEntity(`${DEFINITION_URL}/${definitionId}`, credentials);
}

export function fetchEditPrograms(credentials: CredentialsPayload) {
    return fetchEditEntities(PROGRAM_URL, credentials)
        .then((data) => {
            return data as ProgramTransfer[];
        });
}

export function uploadEditProgram(item: StoredItemTransfer, domainId: number | undefined, credentials: CredentialsPayload) {
    return uploadEditEntity(PROGRAM_URL, item, domainId, credentials);
}

export function deleteEditProgram(programId: number, credentials: CredentialsPayload) {
    return deleteEditEntity(`${PROGRAM_URL}/${programId}`, credentials);
}
