import {Log} from "../utility/log";
import {accessToken} from "../utility/authSlice";
import {readState} from "../utility/store";
import {ApiError, ApiResponse} from './apiResponse';
import {fetchAccessToken} from "../utility/authService";

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

function buildUrl(path: string, queryParams?: any): string {
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

function buildHeaders(headerParams?: any) {
    const headers = new Headers();
    if (headerParams) {
        const values: { [key: string]: any } = headerParams;
        Object.keys(values).forEach((key) => {
            if (values[key] !== undefined) headers.append(key, values[key]);
        })
    }
    return headers;
}

async function authHeader(headers: Headers) {
    if (process.env.REACT_APP_AUTH_RESPONSE === "id_token") {
        headers.set("Authorization", `Bearer ${await fetchAccessToken()}`);
    } else {
        headers.set("Authorization", `Bearer ${readState(accessToken)}`);
    }
    return headers;
}

export async function sendGetRequest(url: string, queryParams?: any, headers?: any) {
    const requestUrl = buildUrl(url, queryParams);
    const requestHeaders = await authHeader(buildHeaders(headers));
    return sendRequest(RequestMethod.GET, requestUrl, requestHeaders);
}

export async function sendPostRequest(url: string, payload: object | FormData, queryParams?: any, headers?: any) {
    const requestUrl = buildUrl(url, queryParams);
    const requestHeaders = await authHeader(buildHeaders(headers));
    const body = requestHeaders.get("Content-Type") === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(RequestMethod.POST, requestUrl, requestHeaders, body);
}

export async function sendPutRequest(url: string, payload: object | FormData, queryParams?: any, headers?: any) {
    const requestUrl = buildUrl(url, queryParams);
    const requestHeaders = await authHeader(buildHeaders(headers));
    const body = requestHeaders.get("Content-Type") === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(RequestMethod.PUT, requestUrl, requestHeaders, body);
}

export async function sendDeleteRequest(url: string, payload?: object | FormData, queryParams?: any, headers?: any) {
    const requestUrl = buildUrl(url, queryParams);
    const requestHeaders = await authHeader(buildHeaders(headers));
    const body = requestHeaders.get("Content-Type") === "application/json" ? JSON.stringify(payload) : payload;
    return sendRequest(RequestMethod.DELETE, requestUrl, requestHeaders, body);
}

export async function sendDirectRequest(method: RequestMethod, url: string, queryParams?: any, headers?: any,
                                        body?: object | FormData, credentials?: RequestCredentials) {
    const requestUrl = buildUrl(url, queryParams);
    const requestHeaders = buildHeaders(headers);
    return sendRequest(method, requestUrl, requestHeaders, body, credentials);
}

async function sendRequest(method: RequestMethod, url: string, headers?: Headers | Record<string, string>,
                           body?: string | object, credentials?: RequestCredentials): Promise<ApiResponse<any>> {
    Log.info(method + " request to URL " + url, "ApiService");
    const init = {
        method: method,
        body: body,
        mode: "cors",
        headers: headers ? headers : undefined,
        credentials: credentials ? credentials : undefined
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
