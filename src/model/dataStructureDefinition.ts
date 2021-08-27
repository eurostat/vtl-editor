export interface DataStructureDefinition {
    agencyId: string;
    id: string;
    version: string;
    name: string;
    dimensions: Dimension[];
    timeDimension: string;
    attributes: Attribute[];
    primaryMeasure: string;
}

interface Dimension extends BaseStruct {
    position: number;
}

type Attribute = BaseStruct;

export interface StructureType {
    type: string;
    agencyId?: string;
    id?: string;
    version?: string;
    textType?: string;
}

export interface BaseStruct {
    id: string;
    name: string;
    structureType: StructureType;
}
