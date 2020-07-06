import {fetchResponse} from "./apiUtils";
import {SDMX_AGENCIES, SDMX_REGISTIRES, SDMX_STRUCTURES, SDMX_DSD, SDMX_CODELIST} from "./apiConsts";
import {CustomResponse} from "../models/api/CustomResponse";
import {SdmxRegistry, SdmxRegistryObject} from "../models/api/SdmxRegistry";
import {AgencyObject} from "../models/api/Agency";
import {DataStructure, DataStructureObject} from "../models/api/DataStructure";
import {DataStructureDefinition, StructureType} from "../models/api/DataStructureDefinition";
import {CodeList} from "../models/api/CodeList";

export async function getSdmxRegistries(): Promise<CustomResponse<SdmxRegistryObject> | undefined> {
    return fetchResponse(SDMX_REGISTIRES);
}

export async function getAgencies(registryId: string): Promise<CustomResponse<AgencyObject> | undefined> {
    return fetchResponse(SDMX_AGENCIES(registryId));
}


export async function getSdmxDataStructures(registryId: string): Promise<CustomResponse<DataStructureObject> | undefined> {
    return fetchResponse(SDMX_STRUCTURES(registryId));
}


export async function getDataStructureDefinition(registryId: string, agencyId: string, id: string, version: string): Promise<CustomResponse<DataStructureDefinition> | undefined> {
    return fetchResponse(SDMX_DSD(registryId, agencyId, id, version))
}

export const fetchDataStructureDefinition = async (registry: SdmxRegistry, ds: DataStructure) => {
    const dataStructureDefinition: CustomResponse<DataStructureDefinition> | undefined =
        await getDataStructureDefinition(registry!.id, ds.agencyId, ds.id, ds.version);
    if (dataStructureDefinition && dataStructureDefinition.data) {
        return dataStructureDefinition.data;
    }
    return null;
}

export async function getCodeList(registryId: string, agencyId: string, id: string, version: string): Promise<CustomResponse<CodeList> | undefined> {
    return fetchResponse(SDMX_CODELIST(registryId, agencyId, id, version))
}

export const fetchCodeList = async (registry: SdmxRegistry, structureType: StructureType) => {
    const codeList: CustomResponse<CodeList> | undefined = await getCodeList(registry!.id, structureType.agencyId!, structureType.id!, structureType.version!);
    if (codeList && codeList.data) {
        return codeList.data;
    }
    return null;
}