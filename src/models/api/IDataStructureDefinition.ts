export interface IDataStructureDefinition {
    agencyId: string,
    id: string,
    version: string,
    name: string
    dimensions: IDimension[],
    timeDimension: string,
    attributes: IAttribute[]
    primaryMeasure: string
}


interface IDimension extends IBaseStruct {
    position: number,
}

interface IAttribute extends IBaseStruct {
}

export interface IStructureType {
    type: string,
    agencyId?: string,
    id?: string,
    version?: string
    textType?: string
}

export interface IBaseStruct {
    id: string,
    name: string,
    structureType: IStructureType
}
