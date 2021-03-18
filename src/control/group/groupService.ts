import { sendDeleteRequest, sendGetRequest, sendPostRequest, sendPutRequest } from "../../web-api/apiService";
import { buildUrl, CTRL_URL, fetchEntities, FORMAT_EXTENDED } from "../controlService";
import { DomainPayload, DomainTransfer, processDomainTransfers } from "../domain/domain";
import { processUserTransfers, UserPayload, UserTransfer } from "../user/user";
import { GroupPayload, GroupTransfer, processGroupTransfer, processGroupTransfers, simpleGroupPayload } from "./group";

const GROUP_URL = CTRL_URL + "/groups";

export async function fetchGroups(format: string = FORMAT_EXTENDED) {
    return fetchEntities(buildUrl(`${GROUP_URL}`, {format: format}), "groups")
        .then((received: GroupTransfer[]) => processGroupTransfers(received));
}

export async function fetchGroup(groupId: number, format: string = FORMAT_EXTENDED, references: boolean = true) {
    const response = await sendGetRequest(
        buildUrl(`${GROUP_URL}/${groupId}`, {format: format, references: references}));
    if (response && response.data) return processGroupTransfer(response.data);
    return Promise.reject();
}

export async function createGroup(payload: GroupPayload) {
    const response = await sendPostRequest(`${GROUP_URL}`, simpleGroupPayload(payload), "application/json");
    if (response && response.data) return processGroupTransfer(response.data);
    return Promise.reject();
}

export async function updateGroup(payload: GroupPayload) {
    const response = await sendPutRequest(`${GROUP_URL}`, simpleGroupPayload(payload), "application/json");
    if (response && response.data) return processGroupTransfer(response.data);
    return Promise.reject();
}

export async function deleteGroup(groupId: number) {
    return sendDeleteRequest(`${GROUP_URL}/${groupId}`);
}

export async function fetchGroupUsers(groupId: number) {
    return fetchEntities(`${GROUP_URL}/${groupId}/users`, "users")
        .then((received: UserTransfer[]) => processUserTransfers(received));
}

export async function fetchGroupDomains(groupId: number) {
    return fetchEntities(`${GROUP_URL}/${groupId}/domains`, "domains")
        .then((received: DomainTransfer[]) => processDomainTransfers(received));
}

export async function updateGroupUsers(groupId: number, payload: UserPayload[] | undefined) {
    if (!payload) return Promise.resolve();
    try {
        const userIds = (await fetchGroupUsers(groupId)).map((user) => user.id);
        const payloadIds = payload.map((user) => user.id);
        const calls = userIds.filter((id) => !payloadIds.includes(id)).map((id) =>
            sendDeleteRequest(`${GROUP_URL}/${groupId}/users/${id}`));
        calls.push(...payloadIds.filter((id) => id && !userIds.includes(id)).map((id) =>
            sendPutRequest(`${GROUP_URL}/${groupId}/users/${id}`, {}, "application/json")));
        return Promise.all(calls);
    } catch {
        return Promise.reject();
    }
}

export async function updateGroupDomains(groupId: number, payload: DomainPayload[] | undefined) {
    if (!payload) return Promise.resolve();
    try {
        const domainIds = (await fetchGroupDomains(groupId)).map((domain) => domain.id);
        const payloadIds = payload.map((domain) => domain.id);
        const calls = domainIds.filter((id) => !payloadIds.includes(id)).map((id) =>
            sendDeleteRequest(`${GROUP_URL}/${groupId}/domains/${id}`));
        calls.push(...payloadIds.filter((id) => id && !domainIds.includes(id)).map((id) =>
            sendPutRequest(`${GROUP_URL}/${groupId}/domains/${id}`, {}, "application/json")));
        return Promise.all(calls);
    } catch {
        return Promise.reject();
    }
}