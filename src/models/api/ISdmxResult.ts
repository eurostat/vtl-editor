import {IBaseStruct} from "./IDataStructureDefinition";
import {ICodeListDetails} from "./ICodeList";

export interface ISdmxResult {
    texts: IBaseStruct[];
    codeLists: ICodeListDetails[];
    primaryMeasure: string,
    timeDimension: string;
}