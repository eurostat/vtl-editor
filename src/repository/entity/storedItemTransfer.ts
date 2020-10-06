import { StoredItemType } from './storedItemType';

export interface StoredItemTransfer {
    id: number
    name: string
    parentFolderId: number
    type: StoredItemType
    optLock: number
    version: number
    createdBy: string
    updatedBy: string
    createDate: Date
    updateDate: Date
}