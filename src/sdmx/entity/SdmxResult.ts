import {BaseStruct} from "./DataStructureDefinition";
import {CodeListDetails} from "./CodeList";
import {DataStructure} from "./DataStructure";

export interface SdmxResult {
    dataStructure: DataStructure,
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