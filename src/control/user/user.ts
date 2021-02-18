import _ from "lodash";
import { convertEntityDates } from "../../web-api/apiUtility";
import { domainsDefaultSort, DomainTransfer } from "../domain/domain";
import { groupsDefaultSort, GroupTransfer } from "../group/group";
import { RoleEntity, rolesDefaultSort, rolesPayload, rolesTransfer } from "../role";
import TrackedEntity from "../trackedEntity";

export interface UserTransfer extends TrackedEntity {
    id: number,
    login: string,
    name?: string,
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    groups?: GroupTransfer[],
    version: number,
}

export interface UserPayload extends TrackedEntity {
    id?: number,
    login: string,
    name?: string,
    firstName: string,
    lastName: string,
    email: string,
    roles?: string[],
    completeRoles?: RoleEntity[],
    domains?: DomainTransfer[],
    groups?: GroupTransfer[],
    version?: number,
}

export function emptyUser(): UserPayload {
    return {
        login: "",
        name: "",
        firstName: "",
        lastName: "",
        email: "",
        roles: [],
        completeRoles: [],
        domains: [],
        groups: [],
    };
}

export function processUserTransfer(user: UserTransfer): UserTransfer {
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
        roles: user.completeRoles ? rolesPayload(user.completeRoles) : undefined,
        version: user.version,
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
    user.completeRoles = rolesTransfer(user.roles);
    return user;
}

function sortCollections(user: UserTransfer): UserTransfer {
    if (user.completeRoles) user.completeRoles = rolesDefaultSort(user.completeRoles);
    if (user.domains) user.domains = domainsDefaultSort(user.domains);
    if (user.groups) user.groups = groupsDefaultSort(user.groups);
    return user;
}