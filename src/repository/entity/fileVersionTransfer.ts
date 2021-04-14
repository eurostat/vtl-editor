import _ from "lodash";
import {convertEntityDates} from "../../web-api/apiUtility";

export interface FileVersionTransfer {
    version: string
    finalized: boolean
    finalizedCaption: string
    updateDate: Date
    updatedBy: string
    restoredFrom: number
    optLock: number
}

export function processVersionTransfer(version: FileVersionTransfer): FileVersionTransfer {
    return _.flow(convertEntityDates, convertFinalized)(version);
}

function convertFinalized(version: FileVersionTransfer): FileVersionTransfer {
    version.finalizedCaption = (version.finalized) ? "Yes" : "No"
    return version;
}