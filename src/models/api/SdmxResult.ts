import {BaseStruct} from "./DataStructureDefinition";
import {CodeListDetails} from "./CodeList";

export interface SdmxResult {
    dataStructureInfo: DataStructureInfo
    dimension: ResultStructure,
    attribute: ResultStructure
    primaryMeasure: string,
    timeDimension: string;
}

interface ResultStructure {
    texts: BaseStruct[],
    codeLists: CodeListDetails[]
}

export interface DataStructureInfo {
    id: string,
    name: string
}