import {fetchResponse} from "./apiUtils";
import {SDMX_AGENCIES, SDMX_REGISTIRES, SDMX_STRUCTURES, SDMX_DSD, SDMX_CODELIST} from "./apiConsts";
import {CustomResponse} from "./CustomResponse";
import {SdmxRegistry, SdmxRegistryObject} from "../sdmx/entity/SdmxRegistry";
import {AgencyObject} from "../sdmx/entity/Agency";
import {DataStructure, DataStructureObject} from "../sdmx/entity/DataStructure";
import {DataStructureDefinition, StructureType} from "../sdmx/entity/DataStructureDefinition";
import {CodeList} from "../sdmx/entity/CodeList";

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