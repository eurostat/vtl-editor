export interface SdmxRegistryObject{
    registries: SdmxRegistry[];
}

export interface SdmxRegistry{
    id: string,
    name:string,
    url: string
}