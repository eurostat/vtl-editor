import {fetchResponse} from "./apiUtils";
import {
    SDMX_REGISTIRES,
    SDMX_AGENCIES,
    SDMX_STRUCTURES,
    SDMX_STRUCTURE_BY_ID,
    SDMX_CODELIST,
    SDMX_DSD
} from "./apiConsts";

export async function getSdmxRegistries() {
    return fetchResponse(SDMX_REGISTIRES);
}

export async function getAgencies(registryId: string) {
    return fetchResponse(SDMX_AGENCIES(registryId));
}


export async function getSdmxDataStructures(registryId: string) {
    return fetchResponse(SDMX_STRUCTURES(registryId));
}