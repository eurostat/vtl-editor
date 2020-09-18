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

export async function sendGetRequest(url: string) {
    return sendRequest(url, RequestMethod.GET);
}

export async function sendPostRequest(url: string, body: object) {
    return sendRequest(url, RequestMethod.POST, body, {'Content-Type': 'application/json'});
}

export async function sendPutRequest(url: string, body: object) {
    return sendRequest(url, RequestMethod.PUT, body, {'Content-Type': 'application/json'});
}

export async function sendDeleteRequest(url: string) {
    return sendRequest(url, RequestMethod.DELETE);
}

async function sendRequest(url: string, method?: RequestMethod, body?: object, headers?: Record<string, string>): Promise<ApiResponse<any>> {
    Log.info((method ? method : "GET") + " request to URL " + url, "ApiService");
    const init = {
        method: method ? method : RequestMethod.GET,
        body: body ? JSON.stringify(body) : undefined,
        headers: headers ? headers : undefined
    };
    try {
        return handleResponse(await fetch(url, init));
    } catch (error) {
        return Promise.reject(handleError(error));
    }
}

export async function handleResponse(response: Response): Promise<ApiResponse<any>> {
    const data = await response.json();
    const result: ApiResponse<any> = Object.assign({}, {
        success: response.ok,
        status: response.status,
        message: response.statusText
    });
    return response.ok
        ? Object.assign(result, {data: data})
        : Object.assign(result, {error: data});
}

export function handleError(error: Error): ApiResponse<any> {
    // eslint-disable-next-line no-console
    console.error("API call failed. " + error);
    return {
        success: false,
        error: {message: "API call failed. " + error} as ApiError
    } as ApiResponse<any>;
}