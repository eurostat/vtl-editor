export interface StoredItemPayload {
    id?: number,
    name: string,
    parentFolderId?: number,
    optLock?: number,
    version?: number
}