import _ from "lodash";
import { convertEntityDates } from "../../web-api/apiUtility";
import { domainsDefaultSort, DomainTransfer, processDomainTransfer } from "../domain/domain";
import { groupsDefaultSort, GroupTransfer, processGroupTransfer } from "../group/group";
import { RoleEntity, rolesDefaultSort, toRolesPayload, processRolesTransfer } from "../role";
import TrackedEntity from "../trackedEntity";

export interface UserTransfer extends TrackedEntity {
    id: number,
    login: string,
    name?: string,
    firstName: string,
    lastName: string,
    email: string,
    allDomains: boolean,
    roles: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    groups?: GroupTransfer[],
    hasAllDomains: boolean,
    optLock: number,
}

export interface UserPayload extends TrackedEntity {
    id?: number,
    login: string,
    name?: string,
    firstName: string,
    lastName: string,
    email: string,
    allDomains: boolean,
    roles?: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    groups?: GroupTransfer[],
    hasAllDomains: boolean,
    optLock?: number,
}

export function emptyUser(): UserPayload {
    return {
        login: "",
        name: "",
        firstName: "",
        lastName: "",
        email: "",
        allDomains: false,
        roles: [],
        completeRoles: [],
        domains: [],
        groups: [],
        hasAllDomains: false,
    };
}

export const nameEmailCaption = (user: UserTransfer) => `${user.name}${!!user.email ? ` (${user.email})` : ""}`;

export function processUserTransfer(user: UserTransfer): UserTransfer {
    if (user.domains) user.domains = user.domains.map((domain) => processDomainTransfer(domain));
    if (user.groups) user.groups = user.groups.map((group) => processGroupTransfer(group));
    return _.flow(convertEntityDates, mergeName, completeRoles, sortCollections)(user);
}

export function processUserTransfers(users: UserTransfer[]): UserTransfer[] {
    return usersDefaultSort(users.map((user) => processUserTransfer(user)));
}

export function toUserPayload(user: UserTransfer): UserPayload {
    return _.cloneDeep(user) as UserPayload;
}

export function simpleUserPayload(user: UserPayload): UserPayload {
    return {
        id: user.id,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        allDomains: user.allDomains,
        roles: user.completeRoles ? toRolesPayload(user.completeRoles) : undefined,
        hasAllDomains: user.hasAllDomains,
        optLock: user.optLock,
    };
}

export function usersDefaultSort(users: UserTransfer[]): UserTransfer[] {
    return [...users].sort((a, b) =>
        a.login.localeCompare(b.login));
}

function mergeName(user: UserTransfer): UserTransfer {
    user.name = `${user.lastName} ${user.firstName}`;
    return user;
}

function completeRoles(user: UserTransfer): UserTransfer {
    user.completeRoles = processRolesTransfer(user.roles);
    return user;
}

function sortCollections(user: UserTransfer): UserTransfer {
    if (user.completeRoles) user.completeRoles = rolesDefaultSort(user.completeRoles);
    if (user.domains) user.domains = domainsDefaultSort(user.domains);
    if (user.groups) user.groups = groupsDefaultSort(user.groups);
    return user;
}