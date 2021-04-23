import _ from "lodash";
import { StructureType } from "./DataStructureDefinition";

export interface SdmxRequest {
    registryId: string,
    resource?: string,
    agencyId?: string,
    resourceId?: string,
    version?: string,
    itemId?: string,
    detail?: string,
    references?: string,
    query?: string,
    page?: number,
    pageSize?: number
}

function mergeSdmxRegistry(registry: string, request: SdmxRequest): SdmxRequest {
    request.registryId = registry;
    return request;
}

function mergeSdmxStructure(structure: StructureType, request: SdmxRequest): SdmxRequest {
    request.agencyId = structure.agencyId;
    request.resourceId = structure.id;
    request.version = structure.version;
    return request;
}

export function buildSdmxRequest(registry: string, structure: StructureType): SdmxRequest {
    return _.flow(_.curry(mergeSdmxRegistry)(registry),
        _.curry(mergeSdmxStructure)(structure))({registryId: ""} as SdmxRequest)
}