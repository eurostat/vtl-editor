import _ from "lodash";
import { convertEntityDates } from "../../web-api/apiUtility";
import { groupsDefaultSort, GroupTransfer } from "../group/group";
import TrackedEntity from "../trackedEntity";
import { usersDefaultSort, UserTransfer } from "../user/user";

export interface DomainTransfer extends TrackedEntity {
    id: number,
    name: string,
    description: string,
    users?: UserTransfer[],
    groups?: GroupTransfer[],
    version: number,
}

export interface DomainPayload extends TrackedEntity {
    id?: number,
    name: string,
    description: string,
    users?: UserTransfer[],
    groups?: GroupTransfer[],
    version?: number,
}

export function emptyDomain(): DomainPayload {
    return {
        name: "",
        description: "",
        users: [],
        groups: [],
    };
}

export function processDomainTransfer(domain: DomainTransfer): DomainTransfer {
    return _.flow(convertEntityDates, sortCollections)(domain);
}

export function processDomainTransfers(domains: DomainTransfer[]): DomainTransfer[] {
    return domainsDefaultSort(domains.map((domain) => processDomainTransfer(domain)));
}

export function toDomainPayload(domain: DomainTransfer): DomainPayload {
    return _.cloneDeep(domain) as DomainPayload;
}

export function simpleDomainPayload(domain: DomainPayload): DomainPayload {
    return {
        id: domain.id,
        name: domain.name,
        description: domain.description,
        version: domain.version,
    };
}

export function domainsDefaultSort(domains: DomainTransfer[]): DomainTransfer[] {
    return [...domains].sort((a, b) =>
        a.name.localeCompare(b.name));
}

function sortCollections(domain: DomainTransfer): DomainTransfer {
    if (domain.users) domain.users = usersDefaultSort(domain.users);
    if (domain.groups) domain.groups = groupsDefaultSort(domain.groups);
    return domain;
}

