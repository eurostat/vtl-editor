import {BaseStruct} from "./DataStructureDefinition";
import {CodeListDetails} from "./CodeList";

export interface SdmxResult {
    dataStructureInfo: DataStructureInfo
    texts: BaseStruct[];
    codeLists: CodeListDetails[];
    primaryMeasure: string,
    timeDimension: string;
}

export interface DataStructureInfo{
    id:string,
    name:string
}