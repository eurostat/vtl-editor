import {sendDeleteRequest, sendGetRequest, sendPostRequest, sendPutRequest} from "../../web-api/apiService";
import {CTRL_URL, fetchEntities, FORMAT_EXTENDED} from "../controlService";
import {DomainTransfer, processDomainTransfers} from "../domain/domain";
import {GroupTransfer, processGroupTransfers} from "../group/group";
import {processUserTransfer, processUserTransfers, simpleUserPayload, UserPayload, UserTransfer} from "./user";

const USER_URL = CTRL_URL + "/users";

export async function fetchUsers(format: string = FORMAT_EXTENDED) {
    return fetchEntities(USER_URL, {format: format}, "users")
        .then((received: UserTransfer[]) => processUserTransfers(received));
}

export async function fetchUser(userId: number, format: string = FORMAT_EXTENDED, references: boolean = true) {
    const response = await sendGetRequest(`${USER_URL}/${userId}`, {format: format, references: references});
    if (response && response.data) return processUserTransfer(response.data);
    return Promise.reject();
}

export async function createUser(payload: UserPayload) {
    const response = await sendPostRequest(`${USER_URL}`, simpleUserPayload(payload),
        undefined, {"Content-Type": "application/json"});
    if (response && response.data) return processUserTransfer(response.data);
    return Promise.reject();
}

export async function updateUser(payload: UserPayload) {
    const response = await sendPutRequest(`${USER_URL}`, simpleUserPayload(payload),
        undefined, {"Content-Type": "application/json"});
    if (response && response.data) return processUserTransfer(response.data);
    return Promise.reject();
}

export async function deleteUser(userId: number) {
    return sendDeleteRequest(`${USER_URL}/${userId}`);
}

export async function fetchUserDomains(userId: number) {
    return fetchEntities(`${USER_URL}/${userId}/domains`, {}, "domains")
        .then((received: DomainTransfer[]) => processDomainTransfers(received));
}

export async function fetchUserGroups(userId: number) {
    return fetchEntities(`${USER_URL}/${userId}/groups`, {}, "groups")
        .then((received: GroupTransfer[]) => processGroupTransfers(received));
}

export async function updateUserDomains(userId: number, payload: DomainTransfer[] | undefined) {
    if (!payload) return Promise.resolve();
    try {
        const domainIds = (await fetchUserDomains(userId)).map((domain) => domain.id);
        const payloadIds = payload.map((domain) => domain.id);
        const calls = domainIds.filter((id) => !payloadIds.includes(id)).map((id) =>
            sendDeleteRequest(`${USER_URL}/${userId}/domains/${id}`));
        calls.push(...payloadIds.filter((id) => id && !domainIds.includes(id)).map((id) =>
            sendPutRequest(`${USER_URL}/${userId}/domains/${id}`, {},
                undefined, {"Content-Type": "application/json"})));
        return Promise.all(calls);
    } catch {
        return Promise.reject();
    }
}

export async function updateUserGroups(userId: number, payload: GroupTransfer[] | undefined) {
    if (!payload) return Promise.resolve();
    try {
        const groupIds = (await fetchUserGroups(userId)).map((group) => group.id);
        const payloadIds = payload.map((group) => group.id);
        const calls = groupIds.filter((id) => !payloadIds.includes(id)).map((id) =>
            sendDeleteRequest(`${USER_URL}/${userId}/groups/${id}`));
        calls.push(...payloadIds.filter((id) => id && !groupIds.includes(id)).map((id) =>
            sendPutRequest(`${USER_URL}/${userId}/groups/${id}`, {},
                undefined, {"Content-Type": "application/json"})));
        return Promise.all(calls);
    } catch {
        return Promise.reject();
    }
}
