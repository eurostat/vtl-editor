import { sendGetRequest } from "../web-api/apiService";
import { processUserProfileTransfer } from "./profile/userProfile";
import { defaultRoles } from "./role";

export const CTRL_URL = process.env.REACT_APP_API_URL + "/ctrl";
export const PROFILE_URL = CTRL_URL + "/profile";

export const FORMAT_SIMPLE = "simple";
export const FORMAT_EXTENDED = "extended";

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
    const response = await sendGetRequest(url);
    if (response && response.data) {
        return response.data[dataField] ?? [];
    }
    return Promise.reject();
}

export async function fetchAllRoles() {
    return defaultRoles;
}

export async function fetchProfile() {
    const response = await sendGetRequest(buildUrl(`${PROFILE_URL}`));
    if (response && response.data) return processUserProfileTransfer(response.data);
    return Promise.reject();
}

export async function fetchProfileRoles() {
    const response = await sendGetRequest(buildUrl(`${PROFILE_URL}/roles`));
    if (response && response.data) return response.data;
    return Promise.reject();
}

export async function fetchProfileDomains() {
    const response = await sendGetRequest(buildUrl(`${PROFILE_URL}/domains`));
    if (response && response.data) return response.data;
    return Promise.reject();
}