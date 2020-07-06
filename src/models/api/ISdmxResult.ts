import {BaseStruct} from "./DataStructureDefinition";
import {CodeListDetails} from "./CodeList";

export interface ISdmxResult {
    texts: BaseStruct[];
    codeLists: CodeListDetails[];
    primaryMeasure: string,
    timeDimension: string;
}