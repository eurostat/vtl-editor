import {RepositoryType} from "../repository/entity/repositoryType";
import {StoredItemTransfer} from "../repository/entity/storedItemTransfer";
import _ from "lodash";

export const DEFAULT_FILENAME = "untitled.vtl";
export const DEFAULT_VERSION = "0.0.0";

export interface EditorFile {
    name: string
    content: string
    changed: boolean
    repository: RepositoryType
    id: number
    parentId: number
    optLock: number
    version: string
}

export const buildEmptyFile = (): EditorFile => {
    return {
        name: DEFAULT_FILENAME,
        content: "",
        changed: false,
        repository: RepositoryType.NONE,
        id: 0,
        parentId: 0,
        optLock: 0,
        version: DEFAULT_VERSION,
    } as EditorFile;
}

export const buildFile = (name?: string, content?: string, changed?: boolean): EditorFile => {
    return _.merge(buildEmptyFile(),
        {name: name || DEFAULT_FILENAME, content: content || "", changed: changed || false});
}

export const buildTransferFile = (file: StoredItemTransfer, content?: string, repository?: RepositoryType): EditorFile => {
    return _.merge(buildEmptyFile(), file, {content: content, repository: repository});
}