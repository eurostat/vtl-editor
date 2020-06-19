export interface IDataStructure {
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