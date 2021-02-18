import _ from "lodash";
import { convertEntityDates } from "../../web-api/apiUtility";
import { domainsDefaultSort, DomainTransfer } from "../domain/domain";
import { RoleEntity, rolesDefaultSort, rolesPayload, rolesTransfer } from "../role";
import TrackedEntity from "../trackedEntity";
import { usersDefaultSort, UserTransfer } from "../user/user";

export interface GroupTransfer extends TrackedEntity {
    id: number,
    name: string,
    description: string,
    users?: UserTransfer[],
    roles: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    version: number,
}

export interface GroupPayload extends TrackedEntity {
    id?: number,
    name: string,
    description: string,
    users?: UserTransfer[],
    roles?: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    version?: number,
}

export function emptyGroup(): GroupPayload {
    return {
        name: "",
        description: "",
        users: [],
        roles: [],
        completeRoles: [],
        domains: [],
    };
}

export function processGroupTransfer(group: GroupTransfer): GroupTransfer {
    return _.flow(convertEntityDates, completeRoles, sortCollections)(group);
}

export function processGroupTransfers(groups: GroupTransfer[]): GroupTransfer[] {
    return groupsDefaultSort(groups.map((group) => processGroupTransfer(group)));
}

export function toGroupPayload(group: GroupTransfer): GroupPayload {
    return _.cloneDeep(group) as GroupPayload;
}

export function simpleGroupPayload(group: GroupPayload): GroupPayload {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        roles: group.completeRoles ? rolesPayload(group.completeRoles) : undefined,
        version: group.version,
    };
}

export function groupsDefaultSort(groups: GroupTransfer[]): GroupTransfer[] {
    return [...groups].sort((a, b) =>
        a.name.localeCompare(b.name));
}

function completeRoles(group: GroupTransfer): GroupTransfer {
    group.completeRoles = rolesTransfer(group.roles);
    return group;
}

function sortCollections(group: GroupTransfer): GroupTransfer {
    if (group.users) group.users = usersDefaultSort(group.users);
    if (group.completeRoles) group.completeRoles = rolesDefaultSort(group.completeRoles);
    if (group.domains) group.domains = domainsDefaultSort(group.domains);
    return group;
}