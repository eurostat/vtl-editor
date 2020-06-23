export interface ISdmxRegistryObject{
    registries: ISdmxRegistry[];
}

export interface ISdmxRegistry{
    id: string,
    name:string,
    url: string
}