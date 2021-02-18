import { sendGetRequest } from "../web-api/apiService";
import { convertEntityDates } from "../web-api/apiUtility";
import { defaultRoles } from "./role";

export const CTRL_URL = process.env.REACT_APP_API_URL + "/ctrl";

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
        return response.data[dataField].map((item: any) => convertEntityDates(item)) ?? [];
    }
    return Promise.reject();
}

export async function fetchRoles() {
    return defaultRoles;
}