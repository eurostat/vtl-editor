import { Log } from "../utility/log";
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
    const headers = accept ? {'Accept': accept} : undefined;
    return sendRequest(url, RequestMethod.GET, headers);
}

export async function sendPostRequest(url: string, payload: object | FormData, contentType?: string) {
    const headers = contentType === "application/json" ? {'Content-Type': 'application/json'} : undefined;
    const body = contentType === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(url, RequestMethod.POST, headers, body);
}

export async function sendPutRequest(url: string, payload: object | FormData, contentType?: string) {
    const headers = contentType === "application/json" ? {'Content-Type': 'application/json'} : undefined;
    const body = contentType === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(url, RequestMethod.PUT, headers, body);
}

export async function sendDeleteRequest(url: string) {
    return sendRequest(url, RequestMethod.DELETE);
}

async function sendRequest(url: string, method?: RequestMethod, headers?: Record<string, string>,
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
    // eslint-disable-next-line no-console
    console.error("API call failed. " + error);
    return {
        success: false,
        error: {message: "API call failed. " + error} as ApiError
    } as ApiResponse<any>;
}