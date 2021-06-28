import _ from "lodash";
import {ApiResponse, sendGetRequest} from "../web-api/apiService";
import {ApiCache} from "./apiCache";
import {Agency} from "./entity/Agency";
import {CodeList} from "./entity/CodeList";
import {DataStructure} from "./entity/DataStructure";
import {DataStructureDefinition} from "./entity/DataStructureDefinition";
import {SdmxRegistry} from "./entity/SdmxRegistry";
import {SdmxRequest} from "./entity/SdmxRequest";

const BASE_URL = process.env.REACT_APP_API_URL;
const SDMX_URL = BASE_URL + "/sdmx";
const apiCache = ApiCache.getInstance();

function buildUrl(request: SdmxRequest): string {
    const url = new URL(`${SDMX_URL}/${request.registryId}/${request.resource}`);
    const params = new URLSearchParams();
    const values: { [key: string]: any } = request;
    Object.keys(values)
        .filter((key) => key !== "registryId" && key !== "resource")
        .forEach((key) => {
            if (values[key] !== undefined) params.append(key, values[key]);
        })
    url.search = params.toString();
    return url.toString();
}

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
    return fetchConcepts(`${SDMX_URL}/${registryId}/agencies`, "agencies", refresh);
}

export async function fetchCodelists(request: SdmxRequest, refresh: boolean): Promise<CodeList[]> {
    return fetchConcepts(buildUrl(_.merge(request, {resource: "codelists"})),
        "codelists", refresh);
}

export async function fetchDataStructures(request: SdmxRequest, refresh: boolean): Promise<DataStructure[]> {
    return fetchConcepts(buildUrl(_.merge(request, {resource: "datastructures"})),
        "dataStructures", refresh);
}

export async function getDataStructureDefinition(registryId: string, agencyId: string, id: string, version: string): Promise<ApiResponse<DataStructureDefinition> | undefined> {
    return sendGetRequest(`${SDMX_URL}/${registryId}/datastructures/${agencyId}/${id}/${version}`)
}

export const fetchDataStructureDefinition = async (registry: SdmxRegistry, ds: DataStructure) => {
    const dataStructureDefinition: ApiResponse<DataStructureDefinition> | undefined =
        await getDataStructureDefinition(registry.id, ds.agencyId, ds.id, ds.version);
    if (dataStructureDefinition && dataStructureDefinition.data) {
        return dataStructureDefinition.data;
    }
    return null;
}
