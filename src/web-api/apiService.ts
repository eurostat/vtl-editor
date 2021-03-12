import { Log } from "../utility/log";
import { accessToken } from "../utility/authSlice";
import { readState } from "../utility/store";
import { ApiError, ApiResponse } from './apiResponse';

export enum RequestMethod {
    DELETE = "DELETE",
    GET = "GET",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT",
    TRACE = "TRACE"
}

export async function sendGetRequest(url: string, accept?: string) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${readState(accessToken)}`);
    if (accept) headers.append("Accept", accept);
    return sendRequest(url, RequestMethod.GET, headers);
}

export async function sendPostRequest(url: string, payload: object | FormData, contentType?: string) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${readState(accessToken)}`);
    if (contentType === "application/json") headers.append("Content-Type", "application/json");
    const body = contentType === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(url, RequestMethod.POST, headers, body);
}

export async function sendPutRequest(url: string, payload: object | FormData, contentType?: string) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${readState(accessToken)}`);
    if (contentType === "application/json") headers.append("Content-Type", "application/json");
    const body = contentType === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(url, RequestMethod.PUT, headers, body);
}

export async function sendDeleteRequest(url: string) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${readState(accessToken)}`);
    return sendRequest(url, RequestMethod.DELETE, headers);
}

async function sendRequest(url: string, method?: RequestMethod, headers?: Headers | Record<string, string>,
                           body?: string | object): Promise<ApiResponse<any>> {
    Log.info((method ? method : "GET") + " request to URL " + url, "ApiService");
    const init = {
        method: method ? method : RequestMethod.GET,
        body: body,
        mode: "cors",
        headers: headers ? headers : undefined
    } as RequestInit;
    try {
        const response: Response = await fetch(url, init);
        const data = await parseData(response);
        if (response.bodyUsed && data === undefined) return Promise.reject(handleError(new Error("Unknown response body received")));
        return response.ok
            ? handleResponse(response, data)
            : Promise.reject(handleError(
                new Error(response.status + " " + response.statusText + " " + (data?.error || "Unknown response body received"))));
    } catch (error) {
        return Promise.reject(handleError(error));
    }
}

export async function parseData(response: Response) {
    const contentType = response.headers.get("content-type") || "";
    const hasJson = contentType.indexOf("application/json") !== -1;
    const hasBlob = contentType.indexOf("application/octet-stream") !== -1;
    return hasJson
        ? await response.json()
        : hasBlob
            ? await response.blob()
            : undefined;
}

export function handleResponse(response: Response, data: any) {
    const result: ApiResponse<any> = Object.assign({}, {
        success: response.ok,
        status: response.status,
        message: response.statusText
    });
    if (response.ok) result.data = data;
    else result.error = data;
    return result;
}

export function handleError(error: Error): ApiResponse<any> {
    return {
        success: false,
        error: {message: "API call failed. " + error} as ApiError
    } as ApiResponse<any>;
}