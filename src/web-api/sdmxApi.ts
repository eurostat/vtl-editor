import { AgencyObject } from "../sdmx/entity/Agency";
import { CodeList } from "../sdmx/entity/CodeList";
import { DataStructure, DataStructureObject } from "../sdmx/entity/DataStructure";
import { DataStructureDefinition, StructureType } from "../sdmx/entity/DataStructureDefinition";
import { SdmxRegistry, SdmxRegistryObject } from "../sdmx/entity/SdmxRegistry";
import { SDMX_AGENCIES, SDMX_CODELIST, SDMX_DSD, SDMX_REGISTIRES, SDMX_STRUCTURES } from "./apiConsts";
import { ApiResponse } from "./apiResponse";
import { sendGetRequest } from "./apiService";

export async function getSdmxRegistries(): Promise<ApiResponse<SdmxRegistryObject> | undefined> {
    return sendGetRequest(SDMX_REGISTIRES);
}

export async function getAgencies(registryId: string): Promise<ApiResponse<AgencyObject> | undefined> {
    return sendGetRequest(SDMX_AGENCIES(registryId));
}

export async function getSdmxDataStructures(registryId: string): Promise<ApiResponse<DataStructureObject> | undefined> {
    return sendGetRequest(SDMX_STRUCTURES(registryId));
}

export async function getDataStructureDefinition(registryId: string, agencyId: string, id: string, version: string): Promise<ApiResponse<DataStructureDefinition> | undefined> {
    return sendGetRequest(SDMX_DSD(registryId, agencyId, id, version))
}

export const fetchDataStructureDefinition = async (registry: SdmxRegistry, ds: DataStructure) => {
    const dataStructureDefinition: ApiResponse<DataStructureDefinition> | undefined =
        await getDataStructureDefinition(registry!.id, ds.agencyId, ds.id, ds.version);
    if (dataStructureDefinition && dataStructureDefinition.data) {
        return dataStructureDefinition.data;
    }
    return null;
}

export async function getCodeList(registryId: string, agencyId: string, id: string, version: string): Promise<ApiResponse<CodeList> | undefined> {
    return sendGetRequest(SDMX_CODELIST(registryId, agencyId, id, version))
}

export const fetchCodeList = async (registry: SdmxRegistry, structureType: StructureType) => {
    const codeList = await getCodeList(registry!.id, structureType.agencyId!, structureType.id!, structureType.version!);
    if (codeList && codeList.data) {
        return codeList.data;
    }
    return null;
}