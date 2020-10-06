export const DEFAULT_FILENAME = "untitled.vtl";

export interface EditorFile {
    name: string,
    content: string,
    changed: boolean,
    remoteId: number,
    optLock: number,
    version: number
}

export const buildFile = (name?: string, content?: string, changed?: boolean, remoteId?: number, optLock?: number, version?: number): EditorFile => {
    return {
        name: name || DEFAULT_FILENAME,
        content: content || "",
        changed: changed || false,
        remoteId: remoteId || 0,
        optLock: optLock || 0,
        version: version || 0
    } as EditorFile;
}