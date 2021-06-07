import {sendGetRequest} from "../web-api/apiService";
import {processUserProfileTransfer} from "./profile/userProfile";
import {defaultRoles} from "./role";
import {processDomainTransfers} from "./domain/domain";

export const CTRL_URL = process.env.REACT_APP_API_URL + "/ctrl";
export const PROFILE_URL = CTRL_URL + "/profile";

export const FORMAT_SIMPLE = "simple";
export const FORMAT_EXTENDED = "extended";

export async function fetchEntities(url: string, queryParams: any, dataField: string) {
    const response = await sendGetRequest(url, queryParams);
    if (response && response.data) {
        return response.data[dataField] ?? [];
    }
    return Promise.reject();
}

export async function fetchAllRoles() {
    return defaultRoles;
}

export async function fetchProfile() {
    const response = await sendGetRequest(PROFILE_URL);
    if (response && response.data) return processUserProfileTransfer(response.data);
    return Promise.reject();
}

export async function fetchProfileRoles() {
    const response = await sendGetRequest(`${PROFILE_URL}/roles`);
    if (response && response.data) return response.data;
    return Promise.reject();
}

export async function fetchProfileDomains() {
    const response = await sendGetRequest(`${PROFILE_URL}/domains`);
    if (response && response.data) return processDomainTransfers(response.data.domains);
    return Promise.reject();
}
