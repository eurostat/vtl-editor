import { StoredItemType } from './storedItemType';

export interface StoredFolderTransfer {
    id: number,
    name: string,
    type: StoredItemType,
    version: number,
    createdBy: string,
    modifiedBy: string,
    createdDate: Date,
    modifiedDate: Date
}