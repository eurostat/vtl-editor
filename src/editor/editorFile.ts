import {RepositoryType} from "../repository/entity/repositoryType";

export const DEFAULT_FILENAME = "untitled.vtl";
export const DEFAULT_VERSION = "0.0.0";

export interface EditorFile {
    name: string
    content: string
    changed: boolean
    repo: RepositoryType
    id: number
    optLock: number
    version: string
}

export const buildFile = (name?: string, content?: string, changed?: boolean,
                          repo?: RepositoryType, id?: number, optLock?: number, version?: string): EditorFile => {
    return {
        name: name || DEFAULT_FILENAME,
        content: content || "",
        changed: changed || false,
        repo: repo || RepositoryType.None,
        id: id || 0,
        optLock: optLock || 0,
        version: version || DEFAULT_VERSION
    } as EditorFile;
}