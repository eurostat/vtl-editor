const BASE_URL = process.env.REACT_APP_API_URL;


/*SDMX ENDPOINTS */

export const SDMX_REGISTIRES = BASE_URL + "/sdmx/registries";
export const SDMX_AGENCIES = (registry: string) => `${BASE_URL}/sdmx/${registry}/agency/scheme`;

export const SDMX_STRUCTURES = (registryId: string) => `${BASE_URL}/sdmx/${registryId}/data/structure`;
export const SDMX_STRUCTURE_BY_ID = (registryId: string, agencyId: string): string => `${SDMX_STRUCTURES(registryId)}/${agencyId}`;

const SDMX_DSD_BASE = (registryId: string) => `${BASE_URL}/sdmx/${registryId}/data/structure`;
export const SDMX_DSD = (registryId: string, agencyId: string, id: string, version: string): string => `${SDMX_DSD_BASE(registryId)}/${agencyId}/${id}/${version}`;

const SDMX_CODELIST_BASE = (registryId: string) => `${BASE_URL}/sdmx/${registryId}/codelist`;
export const SDMX_CODELIST = (registryId: string, agencyId: string, id: string, version: string): string => `${SDMX_CODELIST_BASE(registryId)}/${agencyId}/${id}/${version}`;