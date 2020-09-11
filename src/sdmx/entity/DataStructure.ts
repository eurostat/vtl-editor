export interface DataStructureObject {
    dataStructures:DataStructure[]
}

export interface DataStructure {
    agencyId: string,
    id: string,
    version: string,
    name: string,
    isFinal: FinalStructureEnum
}

export enum FinalStructureEnum {
    TRUE = "TRUE",
    FALSE = "FALSE",
    UNSET = "UNSET",
    ALL = "ALL"
}