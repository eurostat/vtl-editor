import {CustomResponse} from "../models/api/CustomResponse"

export async function fetchResponse(url: string) {
    try {
        console.log("Fetching url: " + url);
        const response = await fetch(url);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
}

export async function postResponse(url: string, body: object) {
    return customMethodWithBody(url, body, "post");
}

export async function putResponse(url: string, body: object) {
    return customMethodWithBody(url, body, "put");
}

export async function customMethodWithBody(url: string, body: object, method: "post" | "put") {
    console.log(method + " url: " + url);
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
}

export async function deleteResponse(url: string) {
    try {
        const response = await fetch(url, {
            method: "DELETE",
        });
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
}

export async function handleResponse(response: Response) {
    if (response.ok) return wrapValidResponse(response);
    else {
        return wrapInvalidResponse(response);
    }

}

// In a real app, would likely call an error logging service.
export function handleError(error: Error):void{
    // eslint-disable-next-line no-console
    console.error("API call failed. " + error);
    throw error;
}


const wrapValidResponse = async (response: Response): Promise<CustomResponse<any>> => {
    const data = await response.json();
    return {status: response.ok, data: data, message: response.statusText};
}

const wrapInvalidResponse = async (response: Response): Promise<CustomResponse<any>> => {
    const data = await response.json();
    return {status: response.ok, message: response.statusText, error: data};
}
