export interface DataStructureInfo {
    registryId: string;
    agencyId: string;
    id: string;
    version: string;
    name: string;
    isFinal: FinalStructureEnum;
}

export enum FinalStructureEnum {
    TRUE = "TRUE",
    FALSE = "FALSE",
    UNSET = "UNSET",
    ALL = "ALL",
}
