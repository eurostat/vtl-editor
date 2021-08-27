import { BaseStruct } from "./dataStructureDefinition";
import { CodeListDetails } from "./codeList";
import { DataStructureInfo } from "./dataStructure";

export interface SdmxResult {
    dataStructure: DataStructureInfo;
    dimension: ResultStructure;
    attribute: ResultStructure;
    primaryMeasure: string;
    timeDimension: string;
}

interface ResultStructure {
    texts: BaseStruct[];
    codeLists: CodeListDetails[];
}
