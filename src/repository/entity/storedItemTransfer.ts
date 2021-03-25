import { StoredItemType } from './storedItemType';

export interface StoredItemTransfer {
    id: number
    name: string
    parentId: number
    type: StoredItemType
    optLock: number
    version: string
    createdBy: string
    updatedBy: string
    createDate: Date
    updateDate: Date
}