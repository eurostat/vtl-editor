import { StoredItemType } from './storedItemType';

export interface ScriptFileTransfer {
    id: number,
    name: string,
    type: StoredItemType,
    revision: number,
    version: number,
    createdBy: string,
    modifiedBy: string,
    createdDate: Date,
    modifiedDate: Date
}