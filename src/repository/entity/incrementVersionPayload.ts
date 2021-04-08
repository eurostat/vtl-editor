export const VERSION_REGEX = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;
export const MINOR_VERSION_REGEX = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0)$/;

export interface IncrementVersionPayload {
    major: string
    minor: string
    squash: boolean
    optLock: number
}

export function buildIncrementPayload(version: string, optLock: number, squash: boolean = false) {
    let major = "0";
    let minor = "0";
    if (VERSION_REGEX.test(version)) {
        const parts = version.split(".");
        major = parts[0];
        minor = parts[1];
    }
    return {
        major: major,
        minor: minor,
        squash: squash,
        optLock: optLock
    } as IncrementVersionPayload
}