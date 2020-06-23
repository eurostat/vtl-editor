import {fetchResponse} from "./apiUtils";
import {SDMX_AGENCIES, SDMX_REGISTIRES, SDMX_STRUCTURES, SDMX_DSD, SDMX_CODELIST} from "./apiConsts";
import {IResponse} from "../models/api/IResponse";
import {ISdmxRegistryObject} from "../models/api/ISdmxRegistry";
import {IAgencyObject} from "../models/api/IAgency";
import {IDataStructureObject} from "../models/api/IDataStructure";
import {IDataStructureDefinition} from "../models/api/IDataStructureDefinition";
import {ICodeList} from "../models/api/ICodeList";

export async function getSdmxRegistries(): Promise<IResponse<ISdmxRegistryObject> | undefined> {
    return fetchResponse(SDMX_REGISTIRES);
}

export async function getAgencies(registryId: string): Promise<IResponse<IAgencyObject> | undefined> {
    return fetchResponse(SDMX_AGENCIES(registryId));
}


export async function getSdmxDataStructures(registryId: string): Promise<IResponse<IDataStructureObject> | undefined> {
    return fetchResponse(SDMX_STRUCTURES(registryId));
}


export async function getDataStructureDefinition(registryId: string, agencyId: string, id: string, version: string): Promise<IResponse<IDataStructureDefinition> | undefined> {
    return fetchResponse(SDMX_DSD(registryId, agencyId, id, version))
}

export async function getCodeList(registryId: string, agencyId: string, id: string, version: string): Promise<IResponse<ICodeList> | undefined> {
    return fetchResponse(SDMX_CODELIST(registryId, agencyId, id, version))
}