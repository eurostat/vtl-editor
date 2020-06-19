export async function fetchResponse(url:string) {
    try {
        console.log("Fetching url: " + url);
        const response = await fetch(url);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
}

export async function postResponse(url:string, body:object) {
    return customMethodWithBody(url, body, "post");
}

export async function putResponse(url:string, body:object) {
    return customMethodWithBody(url, body, "put");
}

export async function customMethodWithBody(url:string, body:object, method:"post"|"put") {
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

export async function deleteResponse(url:string) {
    try {
        const response = await fetch(url, {
            method: "DELETE",
        });
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
}

export async function handleResponse(response:Response) {
    if (response.ok) return response.json();
    if (response.status === 400) {
        // So, a server-side validation error occurred.
        // Server side validation returns a string error message, so parse as text instead of json.
        const error = await response.text();
        console.log("error", error);
        throw new Error(error);
    }
    throw new Error("Network response was not ok.");
}

// In a real app, would likely call an error logging service.
export function handleError(error:Error) {
    // eslint-disable-next-line no-console
    console.error("API call failed. " + error);
    throw error;
}