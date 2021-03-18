import { sendDeleteRequest, sendGetRequest, sendPostRequest, sendPutRequest } from "../../web-api/apiService";
import { buildUrl, CTRL_URL, fetchEntities, FORMAT_EXTENDED } from "../controlService";
import { GroupPayload, GroupTransfer, processGroupTransfers } from "../group/group";
import { processUserTransfers, UserPayload, UserTransfer } from "../user/user";
import {
    DomainPayload,
    DomainTransfer,
    processDomainTransfer,
    processDomainTransfers,
    simpleDomainPayload
} from "./domain";

const DOMAIN_URL = CTRL_URL + "/domains";

export async function fetchDomains(format: string = FORMAT_EXTENDED) {
    return fetchEntities(buildUrl(`${DOMAIN_URL}`, {format: format}), "domains")
        .then((received: DomainTransfer[]) => processDomainTransfers(received));
}

export async function fetchDomain(domainId: number, format: string = FORMAT_EXTENDED, references: boolean = true) {
    const response = await sendGetRequest(
        buildUrl(`${DOMAIN_URL}/${domainId}`, {format: format, references: references}));
    if (response && response.data) return processDomainTransfer(response.data);
    return Promise.reject();
}

export async function createDomain(payload: DomainPayload) {
    const response = await sendPostRequest(`${DOMAIN_URL}`, simpleDomainPayload(payload), "application/json");
    if (response && response.data) return processDomainTransfer(response.data);
    return Promise.reject();
}

export async function updateDomain(payload: DomainPayload) {
    const response = await sendPutRequest(`${DOMAIN_URL}`, simpleDomainPayload(payload), "application/json");
    if (response && response.data) return processDomainTransfer(response.data);
    return Promise.reject();
}

export async function deleteDomain(domainId: number) {
    return sendDeleteRequest(`${DOMAIN_URL}/${domainId}`);
}

export async function fetchDomainUsers(domainId: number) {
    return fetchEntities(`${DOMAIN_URL}/${domainId}/users`, "users")
        .then((received: UserTransfer[]) => processUserTransfers(received));
}

export async function fetchDomainGroups(domainId: number) {
    return fetchEntities(`${DOMAIN_URL}/${domainId}/groups`, "groups")
        .then((received: GroupTransfer[]) => processGroupTransfers(received));
}

export async function updateDomainGroups(domainId: number, payload: GroupPayload[] | undefined) {
    if (!payload) return Promise.resolve();
    try {
        const groupIds = (await fetchDomainGroups(domainId)).map((group) => group.id);
        const payloadIds = payload.map((group) => group.id);
        const calls = groupIds.filter((id) => !payloadIds.includes(id)).map((id) =>
            sendDeleteRequest(`${DOMAIN_URL}/${domainId}/groups/${id}`));
        calls.push(...payloadIds.filter((id) => id && !groupIds.includes(id)).map((id) =>
            sendPutRequest(`${DOMAIN_URL}/${domainId}/groups/${id}`, {}, "application/json")));
        return Promise.all(calls);
    } catch {
        return Promise.reject();
    }
}

export async function updateDomainUsers(domainId: number, payload: UserPayload[] | undefined) {
    if (!payload) return Promise.resolve();
    try {
        const userIds = (await fetchDomainUsers(domainId)).map((user) => user.id);
        const payloadIds = payload.map((user) => user.id);
        const calls = userIds.filter((id) => !payloadIds.includes(id)).map((id) =>
            sendDeleteRequest(`${DOMAIN_URL}/${domainId}/users/${id}`));
        calls.push(...payloadIds.filter((id) => id && !userIds.includes(id)).map((id) =>
            sendPutRequest(`${DOMAIN_URL}/${domainId}/users/${id}`, {}, "application/json")));
        return Promise.all(calls);
    } catch {
        return Promise.reject();
    }
}