import {StoredItemType} from './storedItemType';
import _ from "lodash";
import {convertEntityDates} from "../../web-api/apiUtility";

export interface StoredItemTransfer {
    id: number
    name: string
    parentId: number
    type: StoredItemType
    optLock: number
    version: string
    finalized: string
    finalizedCaption: string
    createdBy: string
    updatedBy: string
    createDate: Date
    updateDate: Date
}

export function processItemTransfer(item: StoredItemTransfer): StoredItemTransfer {
    return _.flow(convertEntityDates, convertFinalized)(item);
}

function convertFinalized(item: StoredItemTransfer): StoredItemTransfer {
    item.finalizedCaption = (item.finalized) ? "Yes" : "No"
    return item;
}