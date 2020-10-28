import { ApiResponse } from "../web-api/apiResponse";
import { sendGetRequest } from "../web-api/apiService";
import { ApiCache } from "./apiCache";
import { Agency } from "./entity/Agency";
import { CodeList } from "./entity/CodeList";
import { DataStructure } from "./entity/DataStructure";
import { DataStructureDefinition, StructureType } from "./entity/DataStructureDefinition";
import { SdmxRegistry } from "./entity/SdmxRegistry";

const BASE_URL = process.env.REACT_APP_API_URL;
const SDMX_URL = BASE_URL + "/sdmx";
const apiCache = ApiCache.getInstance();

export async function fetchConcepts(url: string, dataField: string, refresh: boolean): Promise<any[]> {

    const getConcepts = async (): Promise<any[]> => {
        const response = await sendGetRequest(url);
        if (response && response.data) {
            return response.data[dataField] ?? [];
        }
        return Promise.reject();
    }

    return refresh
        ? apiCache.clearCacheAndAdd(url, getConcepts)
        : apiCache.checkIfExistsInMapOrAdd(url, getConcepts);
}

export async function fetchRegistries(refresh: boolean): Promise<SdmxRegistry[]> {
    return fetchConcepts(`${SDMX_URL}/registries`, "registries", refresh);
}

export async function fetchAgencies(registryId: string, refresh: boolean): Promise<Agency[]> {
    return fetchConcepts(`${SDMX_URL}/${registryId}/agency/scheme`, "agencies", refresh);
}

export async function fetchDataStructures(registryId: string, refresh: boolean): Promise<DataStructure[]> {
    return fetchConcepts(`${SDMX_URL}/${registryId}/data/structure`, "dataStructures", refresh);
}

export async function getDataStructureDefinition(registryId: string, agencyId: string, id: string, version: string): Promise<ApiResponse<DataStructureDefinition> | undefined> {
    return sendGetRequest(`${SDMX_URL}/${registryId}/data/structure/${agencyId}/${id}/${version}`)
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
    return sendGetRequest(`${SDMX_URL}/${registryId}/codelist/${agencyId}/${id}/${version}`);
}

export const fetchCodeList = async (registry: SdmxRegistry, structureType: StructureType) => {
    const codeList = await getCodeList(registry!.id, structureType.agencyId!, structureType.id!, structureType.version!);
    if (codeList && codeList.data) {
        return codeList.data;
    }
    return null;
}