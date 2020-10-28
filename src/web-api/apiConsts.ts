const BASE_URL = process.env.REACT_APP_API_URL;

const SDMX_DSD_BASE = (registryId: string) => `${BASE_URL}/sdmx/${registryId}/data/structure`;
export const SDMX_DSD = (registryId: string, agencyId: string, id: string, version: string): string => `${SDMX_DSD_BASE(registryId)}/${agencyId}/${id}/${version}`;

const SDMX_CODELIST_BASE = (registryId: string) => `${BASE_URL}/sdmx/${registryId}/codelist`;
export const SDMX_CODELIST = (registryId: string, agencyId: string, id: string, version: string): string => `${SDMX_CODELIST_BASE(registryId)}/${agencyId}/${id}/${version}`;